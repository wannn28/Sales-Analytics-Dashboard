/** Views that keep the full analytics report layout in the main area. */
export const ANALYTICS_VIEWS = new Set([
  "Home",
  "Sales analytics",
  "Reports",
  "iQuee",
  "New report",
  "Analytics",
]);

/** Dialog-only actions — never replace the main view. */
export const DIALOG_ONLY = new Set([
  "Settings",
  "Create report",
  "Revenue details",
]);

export function isAnalyticsShell(view: string) {
  return ANALYTICS_VIEWS.has(view);
}

export function reportTitle(view: string) {
  if (view === "Analytics") return "Analytics";
  if (view === "Home") return "Home";
  if (view === "Reports") return "Reports";
  if (view === "iQuee") return "iQuee sales";
  return "New report";
}
