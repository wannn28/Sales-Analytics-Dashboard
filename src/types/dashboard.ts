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
export interface Customer {
  id: number;
  name: string;
  revenue: number;
  deals: number;
  lost: number;
}
export interface Notification {
  id: number;
  title: string;
  body: string;
  amount: number;
  closedAt: string;
  employee: string;
  customer: string;
}
export interface Deal {
  id: number;
  customerId: number;
  customer: string;
  employeeId: number;
  employee: string;
  employeeInitials: string;
  employeeColor: string;
  platformId: number;
  platform: string;
  amount: number;
  status: "won" | "lost" | "open" | string;
  closedAt: string;
}
export interface DashboardData {
  summary: Summary;
  revenue: RevenuePoint[];
  platforms: Platform[];
  dynamics: DynamicPoint[];
  team: Employee[];
  topSales: Employee | null;
  customers: Customer[];
  notifications: Notification[];
  deals: Deal[];
}
