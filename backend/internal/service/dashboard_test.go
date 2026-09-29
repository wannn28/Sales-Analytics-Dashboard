package service

import (
	"net/url"
	"testing"
)

func TestParseFilter(t *testing.T) {
	for _, query := range []string{"period=bad", "employee=-1", "employee=1 OR 1=1", "employee=5"} {
		q, _ := url.ParseQuery(query)
		if _, err := ParseFilter(q); err == nil {
			t.Errorf("expected invalid filter: %s", query)
		}
	}
	f, err := ParseFilter(url.Values{"period": {"month"}, "employee": {"2"}})
	if err != nil || f.Employee != 2 || f.Start.Format("2006-01-02") != "2023-11-01" {
		t.Fatalf("incorrect filter: %+v %v", f, err)
	}
}
