package repository

import (
	"context"
	"github.com/jackc/pgx/v5/pgxpool"
	"sales-dashboard/internal/model"
)

type Repository struct{ DB *pgxpool.Pool }

func (r *Repository) Summary(ctx context.Context, f model.Filter) (model.Summary, error) {
	s := model.Summary{Start: f.Start.Format("2006-01-02"), End: f.End.Format("2006-01-02")}
	err := r.DB.QueryRow(ctx, `SELECT COALESCE(SUM(amount) FILTER (WHERE status='won'),0), COUNT(*) FILTER (WHERE status='won'), COALESCE(AVG(amount) FILTER (WHERE status='won'),0), COALESCE(100.0*COUNT(*) FILTER (WHERE status='won')/NULLIF(COUNT(*),0),0) FROM deals WHERE closed_at BETWEEN $1 AND $2 AND ($3=0 OR employee_id=$3)`, f.Start, f.End, f.Employee).Scan(&s.Revenue, &s.Deals, &s.AverageValue, &s.WinRate)
	if err != nil {
		return s, err
	}
	months := (f.End.Year()-f.Start.Year())*12 + int(f.End.Month()-f.Start.Month()) + 1
	previousStart, previousEnd := f.Start.AddDate(0, -months, 0), f.Start.AddDate(0, 0, -1)
	s.PreviousStart, s.PreviousEnd = previousStart.Format("2006-01-02"), previousEnd.Format("2006-01-02")
	err = r.DB.QueryRow(ctx, `SELECT COALESCE(SUM(amount),0) FROM deals WHERE status='won' AND closed_at BETWEEN $1 AND $2 AND ($3=0 OR employee_id=$3)`, previousStart, previousEnd, f.Employee).Scan(&s.PreviousRevenue)
	if err != nil {
		return s, err
	}
	if s.PreviousRevenue > 0 {
		s.Growth = (s.Revenue/s.PreviousRevenue - 1) * 100
	}
	err = r.DB.QueryRow(ctx, `SELECT COALESCE((SELECT amount FROM deals WHERE status='won' AND closed_at BETWEEN $1 AND $2 AND ($3=0 OR employee_id=$3) ORDER BY amount DESC,id LIMIT 1),0), COALESCE((SELECT c.name FROM deals d JOIN customers c ON c.id=d.customer_id WHERE status='won' AND closed_at BETWEEN $1 AND $2 AND ($3=0 OR employee_id=$3) ORDER BY amount DESC,d.id LIMIT 1),'—')`, f.Start, f.End, f.Employee).Scan(&s.BestDeal, &s.BestCustomer)
	return s, err
}
func (r *Repository) Team(ctx context.Context, f model.Filter) ([]model.Employee, error) {
	rows, err := r.DB.Query(ctx, `SELECT e.id,e.name,e.initials,e.color,COALESCE(SUM(d.amount) FILTER(WHERE d.status='won'),0),e.leads,COUNT(d.id) FILTER(WHERE d.status='won'),e.kpi,COALESCE(100.0*COUNT(d.id) FILTER(WHERE d.status='won')/NULLIF(COUNT(d.id),0),0) FROM employees e LEFT JOIN deals d ON d.employee_id=e.id AND d.closed_at BETWEEN $1 AND $2 WHERE ($3=0 OR e.id=$3) GROUP BY e.id ORDER BY e.id`, f.Start, f.End, f.Employee)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []model.Employee{}
	for rows.Next() {
		var e model.Employee
		if err := rows.Scan(&e.ID, &e.Name, &e.Initials, &e.Color, &e.Revenue, &e.Leads, &e.Deals, &e.KPI, &e.WinRate); err != nil {
			return nil, err
		}
		result = append(result, e)
	}
	return result, rows.Err()
}
func (r *Repository) Platforms(ctx context.Context, f model.Filter) ([]model.Platform, error) {
	rows, err := r.DB.Query(ctx, `SELECT p.id,p.name,COALESCE(SUM(d.amount),0),COUNT(d.id) FROM platforms p LEFT JOIN deals d ON d.platform_id=p.id AND d.status='won' AND d.closed_at BETWEEN $1 AND $2 AND ($3=0 OR d.employee_id=$3) GROUP BY p.id ORDER BY p.id`, f.Start, f.End, f.Employee)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []model.Platform{}
	total := 0.0
	for rows.Next() {
		var p model.Platform
		if err := rows.Scan(&p.ID, &p.Name, &p.Revenue, &p.Deals); err != nil {
			return nil, err
		}
		total += p.Revenue
		result = append(result, p)
	}
	for i := range result {
		if total > 0 {
			result[i].Share = result[i].Revenue / total * 100
		}
	}
	return result, rows.Err()
}
func (r *Repository) Revenue(ctx context.Context, f model.Filter) ([]model.RevenuePoint, error) {
	rows, err := r.DB.Query(ctx, `SELECT to_char(date_trunc('month',closed_at)+CASE WHEN extract(day FROM closed_at)>15 THEN INTERVAL '15 days' ELSE INTERVAL '0 days' END,'Mon DD') label,COALESCE(SUM(amount) FILTER (WHERE status='won'),0),COUNT(*),COALESCE(round(COUNT(*) FILTER (WHERE status='won')::numeric/NULLIF(COUNT(*),0),2),0) FROM deals WHERE closed_at BETWEEN $1 AND $2 AND ($3=0 OR employee_id=$3) AND ($4=0 OR platform_id=$4) GROUP BY date_trunc('month',closed_at)+CASE WHEN extract(day FROM closed_at)>15 THEN INTERVAL '15 days' ELSE INTERVAL '0 days' END ORDER BY MIN(closed_at)`, f.Start, f.End, f.Employee, f.Platform)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []model.RevenuePoint{}
	for rows.Next() {
		var p model.RevenuePoint
		if err := rows.Scan(&p.Label, &p.Revenue, &p.Leads, &p.KPI); err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, rows.Err()
}
func (r *Repository) Dynamics(ctx context.Context, f model.Filter) ([]model.DynamicPoint, error) {
	rows, err := r.DB.Query(ctx, `WITH dates AS (SELECT generate_series($1::date,$2::date,'1 day')::date AS report_date), totals AS (SELECT closed_at,SUM(amount) total FROM deals WHERE status='won' AND ($3=0 OR employee_id=$3) GROUP BY closed_at) SELECT to_char(report_date,'YYYY-MM-DD'),COALESCE(c.total,0),COALESCE(p.total,0) FROM dates LEFT JOIN totals c ON c.closed_at=report_date LEFT JOIN totals p ON p.closed_at=report_date-($2::date-$1::date+1) ORDER BY report_date`, f.Start, f.End, f.Employee)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	result := []model.DynamicPoint{}
	for rows.Next() {
		var p model.DynamicPoint
		if err := rows.Scan(&p.Date, &p.Revenue, &p.Previous); err != nil {
			return nil, err
		}
		result = append(result, p)
	}
	return result, rows.Err()
}
