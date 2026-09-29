package service

import (
	"net/url"
	"testing"
)

func TestParseFilter(t *testing.T) {
	for _, query := range []string{"period=bad", "employee=-1", "employee=1 OR 1=1", "status=pending", "limit=9999"} {
		q, _ := url.ParseQuery(query)
		if _, err := ParseFilter(q); err == nil {
			t.Errorf("expected invalid filter: %s", query)
		}
	}
	f, err := ParseFilter(url.Values{"period": {"month"}, "employee": {"2"}, "customer": {"3"}, "status": {"won"}, "limit": {"50"}})
	if err != nil || f.Employee != 2 || f.Customer != 3 || f.Status != "won" || f.Limit != 50 || f.Start.Format("2006-01-02") != "2023-11-01" {
		t.Fatalf("incorrect filter: %+v %v", f, err)
	}
}
