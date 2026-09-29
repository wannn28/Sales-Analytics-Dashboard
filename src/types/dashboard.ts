export interface Employee {
  id: number;
  name: string;
  initials: string;
  color: string;
  revenue: number;
  leads: number;
  deals: number;
  kpi: number;
  winRate: number;
}
export interface Summary {
  revenue: number;
  previousRevenue: number;
  growth: number;
  deals: number;
  averageValue: number;
  winRate: number;
  bestDeal: number;
  bestCustomer: string;
  start: string;
  end: string;
  previousStart: string;
  previousEnd: string;
}
export interface Platform {
  id: number;
  name: string;
  revenue: number;
  share: number;
  deals: number;
}
export interface RevenuePoint {
  label: string;
  revenue: number;
  leads: number;
  kpi: number;
}
export interface DynamicPoint {
  date: string;
  revenue: number;
  previous: number;
}
export interface DashboardData {
  summary: Summary;
  revenue: RevenuePoint[];
  platforms: Platform[];
  dynamics: DynamicPoint[];
  team: Employee[];
  topSales: Employee | null;
}
