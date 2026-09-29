package service

import (
	"context"
	"fmt"
	"net/url"
	"sales-dashboard/internal/model"
	"sales-dashboard/internal/repository"
	"strconv"
	"time"
)

type Service struct{ Repo *repository.Repository }

// Demo periods match the supplied design. Live applications should use their own reporting dates.
func ParseFilter(q url.Values) (model.Filter, error) {
	start := "2023-09-01"
	end := "2023-11-30"
	switch q.Get("period") {
	case "", "quarter":
	case "month":
		start = "2023-11-01"
	case "all":
		start = "2023-06-01"
	default:
		return model.Filter{}, fmt.Errorf("period must be quarter, month, or all")
	}
	s, _ := time.Parse("2006-01-02", start)
	e, _ := time.Parse("2006-01-02", end)
	f := model.Filter{Start: s, End: e}
	if value := q.Get("employee"); value != "" {
		id, err := strconv.Atoi(value)
		if err != nil || id < 1 || id > 4 {
			return f, fmt.Errorf("employee must be between 1 and 4")
		}
		f.Employee = id
	}
	if value := q.Get("platform"); value != "" {
		id, err := strconv.Atoi(value)
		if err != nil || id < 1 || id > 5 {
			return f, fmt.Errorf("platform must be between 1 and 5")
		}
		f.Platform = id
	}
	return f, nil
}
func (s *Service) Get(ctx context.Context, kind string, f model.Filter) (any, error) {
	switch kind {
	case "summary":
		return s.Repo.Summary(ctx, f)
	case "revenue":
		return s.Repo.Revenue(ctx, f)
	case "platforms":
		return s.Repo.Platforms(ctx, f)
	case "sales-dynamics":
		return s.Repo.Dynamics(ctx, f)
	case "team-performance":
		return s.Repo.Team(ctx, f)
	case "top-sales":
		team, err := s.Repo.Team(ctx, f)
		if err != nil {
			return nil, err
		}
		var best *model.Employee
		for i := range team {
			if best == nil || team[i].Deals > best.Deals {
				best = &team[i]
			}
		}
		return best, nil
	case "customers":
		return s.Repo.Customers(ctx, f)
	case "notifications":
		return s.Repo.Notifications(ctx, f)
	}
	return nil, fmt.Errorf("unknown dashboard resource")
}
