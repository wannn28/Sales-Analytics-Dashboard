package handler

import (
	"net/http/httptest"
	"testing"
)

func TestOriginCheck(t *testing.T) {
	for _, tc := range []struct {
		origin string
		valid  bool
	}{{"https://sales.iquee.tech", true}, {"https://evil.example", false}, {"", false}, {"null", false}, {"https://sales.iquee.tech.evil.example", false}} {
		r := httptest.NewRequest("POST", "https://sales.iquee.tech/api/auth/login", nil)
		r.Header.Set("Origin", tc.origin)
		if sameOrigin(r) != tc.valid {
			t.Errorf("unexpected result for %q", tc.origin)
		}
	}
}
func TestCookieFlags(t *testing.T) {
	a := Auth{Secure: true}
	c := a.cookie("random", 43200)
	if !c.Secure || !c.HttpOnly || c.MaxAge != 43200 {
		t.Fatal("unsafe session cookie")
	}
	if a.cookie("", -1).MaxAge != -1 {
		t.Fatal("logout must expire cookie")
	}
}
