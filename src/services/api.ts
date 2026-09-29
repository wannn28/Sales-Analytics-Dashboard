import type { DashboardData } from "../types/dashboard";
async function get<T>(
  path: string,
  query: URLSearchParams,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/v1/dashboard/${path}?${query}`, {
    signal,
  });
  if (response.status === 401)
    window.dispatchEvent(new Event("session-expired"));
  if (!response.ok)
    throw new Error(
      `Unable to load your report (${response.status}). Please try again.`,
    );
  return response.json() as Promise<T>;
}
export async function loadDashboard(
  days: string,
  employee: number | null,
  signal: AbortSignal,
): Promise<DashboardData> {
  const query = new URLSearchParams({ period: days });
  if (employee) query.set("employee", String(employee));
  const [summary, revenue, platforms, dynamics, team, topSales] =
    await Promise.all([
      get<DashboardData["summary"]>("summary", query, signal),
      get<DashboardData["revenue"]>("revenue", query, signal),
      get<DashboardData["platforms"]>("platforms", query, signal),
      get<DashboardData["dynamics"]>("sales-dynamics", query, signal),
      get<DashboardData["team"]>("team-performance", query, signal),
      get<DashboardData["topSales"]>("top-sales", query, signal),
    ]);
  return { summary, revenue, platforms, dynamics, team, topSales };
}

export async function loadMemberDetails(
  period: string,
  employee: number,
  signal: AbortSignal,
) {
  const query = new URLSearchParams({ period, employee: String(employee) });
  const [platforms, dynamics] = await Promise.all([
    get<DashboardData["platforms"]>("platforms", query, signal),
    get<DashboardData["dynamics"]>("sales-dynamics", query, signal),
  ]);
  return { platforms, dynamics };
}

export function loadPlatformRevenue(
  period: string,
  employee: number | null,
  platform: number,
  signal: AbortSignal,
) {
  const query = new URLSearchParams({ period, platform: String(platform) });
  if (employee) query.set("employee", String(employee));
  return get<DashboardData["revenue"]>("revenue", query, signal);
}
