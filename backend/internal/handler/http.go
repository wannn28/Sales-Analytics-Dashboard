package handler

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"sales-dashboard/internal/service"
	"time"
)

func Router(s *service.Service) http.Handler {
	mux := http.NewServeMux()
	auth := NewAuth(s.Repo.DB)
	auth.Register(mux)
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer cancel()
		if err := s.Repo.DB.Ping(ctx); err != nil {
			write(w, 503, map[string]string{"status": "unavailable"})
			return
		}
		write(w, 200, map[string]string{"status": "ok", "database": "connected"})
	})
	for _, kind := range []string{"summary", "revenue", "platforms", "sales-dynamics", "team-performance", "top-sales", "customers", "notifications"} {
		mux.HandleFunc("GET /api/v1/dashboard/"+kind, auth.Protect(func(w http.ResponseWriter, r *http.Request) {
			f, err := service.ParseFilter(r.URL.Query())
			if err != nil {
				write(w, 400, map[string]string{"error": err.Error()})
				return
			}
			ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
			defer cancel()
			result, err := s.Get(ctx, kind, f)
			if err != nil {
				slog.Error("dashboard query failed", "resource", kind, "error", err)
				write(w, 500, map[string]string{"error": "Unable to retrieve dashboard data"})
				return
			}
			write(w, 200, result)
		}))
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		mux.ServeHTTP(w, r)
	})
}
func write(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		slog.Error("response encoding failed", "error", err)
	}
}
