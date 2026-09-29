package model

import "time"

type Filter struct {
	Start, End time.Time
	Employee   int
	Platform   int
}
type Summary struct {
	Revenue         float64 `json:"revenue"`
	PreviousRevenue float64 `json:"previousRevenue"`
	Growth          float64 `json:"growth"`
	Deals           int     `json:"deals"`
	AverageValue    float64 `json:"averageValue"`
	WinRate         float64 `json:"winRate"`
	BestDeal        float64 `json:"bestDeal"`
	BestCustomer    string  `json:"bestCustomer"`
	Start           string  `json:"start"`
	End             string  `json:"end"`
	PreviousStart   string  `json:"previousStart"`
	PreviousEnd     string  `json:"previousEnd"`
}
type Employee struct {
	ID       int     `json:"id"`
	Name     string  `json:"name"`
	Initials string  `json:"initials"`
	Color    string  `json:"color"`
	Revenue  float64 `json:"revenue"`
	Leads    int     `json:"leads"`
	Deals    int     `json:"deals"`
	KPI      float64 `json:"kpi"`
	WinRate  float64 `json:"winRate"`
}
type Platform struct {
	ID      int     `json:"id"`
	Name    string  `json:"name"`
	Revenue float64 `json:"revenue"`
	Share   float64 `json:"share"`
	Deals   int     `json:"deals"`
}
type RevenuePoint struct {
	Label   string  `json:"label"`
	Revenue float64 `json:"revenue"`
	Leads   int     `json:"leads"`
	KPI     float64 `json:"kpi"`
}
type DynamicPoint struct {
	Date     string  `json:"date"`
	Revenue  float64 `json:"revenue"`
	Previous float64 `json:"previous"`
}
