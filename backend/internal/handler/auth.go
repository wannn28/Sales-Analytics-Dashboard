package handler

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

type User struct {
	ID    int64  `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}
type attempt struct {
	Count int
	Until time.Time
}
type Auth struct {
	DB        *pgxpool.Pool
	Secure    bool
	mu        sync.Mutex
	attempts  map[string]attempt
	dummyHash []byte
}

func NewAuth(db *pgxpool.Pool) *Auth {
	dummy, _ := bcrypt.GenerateFromPassword([]byte("unused-timing-placeholder"), 12)
	return &Auth{DB: db, Secure: os.Getenv("COOKIE_SECURE") == "true", attempts: make(map[string]attempt), dummyHash: dummy}
}
func (a *Auth) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /api/auth/login", a.login)
	mux.HandleFunc("POST /api/auth/logout", a.logout)
	mux.HandleFunc("GET /api/auth/me", func(w http.ResponseWriter, r *http.Request) {
		u, err := a.user(r)
		if err != nil {
			authError(w, err)
			return
		}
		write(w, 200, u)
	})
}
func authError(w http.ResponseWriter, err error) {
	if errors.Is(err, pgx.ErrNoRows) || errors.Is(err, http.ErrNoCookie) {
		write(w, 401, map[string]string{"error": "Sign in to continue"})
	} else {
		write(w, 503, map[string]string{"error": "Authentication temporarily unavailable"})
	}
}
func (a *Auth) Protect(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if _, err := a.user(r); err != nil {
			authError(w, err)
			return
		}
		next(w, r)
	}
}
func (a *Auth) user(r *http.Request) (User, error) {
	var u User
	c, err := r.Cookie("sales_session")
	if err != nil {
		return u, err
	}
	if len(c.Value) != 64 {
		return u, http.ErrNoCookie
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	err = a.DB.QueryRow(ctx, `SELECT u.id,u.email,u.name FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()`, hash(c.Value)).Scan(&u.ID, &u.Email, &u.Name)
	return u, err
}
func sameOrigin(r *http.Request) bool {
	origin, err := url.Parse(r.Header.Get("Origin"))
	return err == nil && (origin.Scheme == "http" || origin.Scheme == "https") && origin.Host == r.Host
}
func (a *Auth) login(w http.ResponseWriter, r *http.Request) {
	if !sameOrigin(r) {
		write(w, 403, map[string]string{"error": "Invalid request origin"})
		return
	}
	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if net.ParseIP(ip).IsLoopback() && net.ParseIP(r.Header.Get("X-Real-IP")) != nil {
		ip = r.Header.Get("X-Real-IP")
	}
	a.mu.Lock()
	now := time.Now()
	for k, v := range a.attempts {
		if now.After(v.Until) {
			delete(a.attempts, k)
		}
	}
	entry := a.attempts[ip]
	if entry.Count >= 10 || len(a.attempts) > 10000 {
		a.mu.Unlock()
		w.Header().Set("Retry-After", "900")
		write(w, 429, map[string]string{"error": "Too many attempts. Try again in 15 minutes."})
		return
	}
	if entry.Count == 0 {
		entry.Until = now.Add(15 * time.Minute)
	}
	entry.Count++
	a.attempts[ip] = entry
	a.mu.Unlock()
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 4096))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil || len(input.Password) > 72 {
		write(w, 400, map[string]string{"error": "Invalid login request"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()
	var u User
	var passwordHash string
	err := a.DB.QueryRow(ctx, `SELECT id,email,name,password_hash FROM users WHERE email=$1`, strings.ToLower(strings.TrimSpace(input.Email))).Scan(&u.ID, &u.Email, &u.Name, &passwordHash)
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		write(w, 503, map[string]string{"error": "Authentication temporarily unavailable"})
		return
	}
	candidate := []byte(passwordHash)
	if err != nil {
		candidate = a.dummyHash
	}
	valid := bcrypt.CompareHashAndPassword(candidate, []byte(input.Password)) == nil
	if err != nil || !valid {
		write(w, 401, map[string]string{"error": "Email or password is incorrect"})
		return
	}
	token := make([]byte, 32)
	if _, err = rand.Read(token); err != nil {
		write(w, 500, map[string]string{"error": "Unable to sign in"})
		return
	}
	value := hex.EncodeToString(token)
	tx, err := a.DB.Begin(ctx)
	if err != nil {
		write(w, 503, map[string]string{"error": "Unable to sign in"})
		return
	}
	defer tx.Rollback(ctx)
	if old, e := r.Cookie("sales_session"); e == nil {
		if _, err = tx.Exec(ctx, `DELETE FROM sessions WHERE token_hash=$1`, hash(old.Value)); err != nil {
			write(w, 503, map[string]string{"error": "Unable to sign in"})
			return
		}
	}
	if _, err = tx.Exec(ctx, `DELETE FROM sessions WHERE expires_at<now()`); err != nil {
		write(w, 503, map[string]string{"error": "Unable to sign in"})
		return
	}
	if _, err = tx.Exec(ctx, `INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,$3)`, hash(value), u.ID, time.Now().Add(12*time.Hour)); err != nil {
		write(w, 503, map[string]string{"error": "Unable to sign in"})
		return
	}
	if err = tx.Commit(ctx); err != nil {
		write(w, 503, map[string]string{"error": "Unable to sign in"})
		return
	}
	a.mu.Lock()
	delete(a.attempts, ip)
	a.mu.Unlock()
	http.SetCookie(w, a.cookie(value, 43200))
	write(w, 200, u)
}
func (a *Auth) logout(w http.ResponseWriter, r *http.Request) {
	if !sameOrigin(r) {
		write(w, 403, map[string]string{"error": "Invalid request origin"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if c, err := r.Cookie("sales_session"); err == nil {
		if _, err = a.DB.Exec(ctx, `DELETE FROM sessions WHERE token_hash=$1`, hash(c.Value)); err != nil {
			write(w, 503, map[string]string{"error": "Unable to sign out. Try again."})
			return
		}
	}
	http.SetCookie(w, a.cookie("", -1))
	write(w, 200, map[string]bool{"ok": true})
}
func (a *Auth) cookie(value string, age int) *http.Cookie {
	return &http.Cookie{Name: "sales_session", Value: value, Path: "/", HttpOnly: true, Secure: a.Secure, SameSite: http.SameSiteStrictMode, MaxAge: age}
}
func hash(value string) string { h := sha256.Sum256([]byte(value)); return hex.EncodeToString(h[:]) }
func CreateAdmin(ctx context.Context, db *pgxpool.Pool) error {
	email := strings.ToLower(strings.TrimSpace(os.Getenv("ADMIN_EMAIL")))
	password := os.Getenv("ADMIN_PASSWORD")
	if !strings.Contains(email, "@") || len(password) < 12 || len(password) > 72 {
		return fmt.Errorf("ADMIN_EMAIL and ADMIN_PASSWORD (12–72 bytes) are required")
	}
	h, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return err
	}
	_, err = db.Exec(ctx, `INSERT INTO users(email,name,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING`, email, "Workspace admin", string(h))
	return err
}
