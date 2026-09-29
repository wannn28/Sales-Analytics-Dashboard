/** Views that keep the full analytics report layout in the main area. */
export const ANALYTICS_VIEWS = new Set([
  "Home",
  "Sales analytics",
  "Reports",
  "All accounts",
  "New report",
  "Analytics",
]);

/** Dialog-only actions — never replace the main view. */
export const DIALOG_ONLY = new Set([
  "Settings",
  "Create report",
  "Create dashboard",
  "Revenue details",
]);

export function isAnalyticsShell(view: string) {
  return ANALYTICS_VIEWS.has(view);
}

export function reportTitle(view: string) {
  if (view === "Analytics") return "Analytics";
  if (view === "Home") return "Home";
  if (view === "Reports") return "Reports";
  if (view === "All accounts") return "All accounts";
  if (view === "Sales analytics") return "Sales analytics";
  return "New report";
}
