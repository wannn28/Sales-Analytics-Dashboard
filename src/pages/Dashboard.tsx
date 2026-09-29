import { useEffect, useMemo, useRef, useState } from "react";
import { X, LoaderCircle, Check, AlertCircle } from "lucide-react";
import { Header } from "../components/layout/Header";
import { IconSidebar } from "../components/layout/IconSidebar";
import { NavigationSidebar } from "../components/layout/NavigationSidebar";
import { RevenueHeader } from "../components/dashboard/RevenueHeader";
import { SalesOverview } from "../components/dashboard/SalesOverview";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { TeamPerformance } from "../components/dashboard/TeamPerformance";
import { WorkspaceViews, RecentDealsPanel } from "../components/WorkspaceViews";
import { money } from "../components/ui";
import { DIALOG_ONLY, isAnalyticsShell, reportTitle } from "../nav";
import { loadDashboard } from "../services/api";
import type { Customer, DashboardData, Employee } from "../types/dashboard";
import type { User } from "../App";

export function Dashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => Promise<void>;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Employee[]>([]);
  const [period, setPeriod] = useState("quarter");
  const [employee, setEmployee] = useState<number | null>(null);
  const [platform, setPlatform] = useState("Dribbble");
  const [search, setSearch] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [active, setActive] = useState("Sales analytics");
  const [title, setTitle] = useState("Sales analytics");
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [customAccounts, setCustomAccounts] = useState<Customer[]>([]);
  const [customReports, setCustomReports] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const nextAccountId = useRef(-1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    loadDashboard(period, employee, controller.signal)
      .then((result) => {
        setData(result);
        if (!employee) setMembers(result.team);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [period, employee, retry]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (modal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [modal]);

  const navCustomers = useMemo(() => {
    const fromApi = data?.customers ?? [];
    const extras = customAccounts.filter(
      (a) => !fromApi.some((c) => c.name.toLowerCase() === a.name.toLowerCase()),
    );
    return [...fromApi, ...extras];
  }, [data?.customers, customAccounts]);

  const viewData = useMemo(() => {
    if (!data) return null;
    return { ...data, customers: navCustomers };
  }, [data, navCustomers]);

  const selectNav = (name: string) => {
    if (DIALOG_ONLY.has(name)) {
      setModal(name);
      return;
    }
    setActive(name);
    if (isAnalyticsShell(name)) setTitle(reportTitle(name));
  };

  const exportReport = () => {
    if (!data) return;
    const csv =
      "Salesperson,Revenue,Deals,Leads,Win rate\n" +
      data.team
        .map((p) => `${p.name},${p.revenue},${p.deals},${p.leads},${p.winRate}`)
        .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sales-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setToast("Report exported");
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Dashboard link copied");
    } catch {
      setToast("Copy the dashboard URL from your address bar");
    }
  };

  const showAnalytics =
    active === "Sales analytics" ||
    active === "All accounts" ||
    active === "New report" ||
    active === "Analytics" ||
    customReports.includes(active);

  return (
    <div className="app-shell">
      <IconSidebar
        active={active}
        hasNotifications={Boolean(data?.notifications.length)}
        onAction={selectNav}
        onLogout={async () => {
          try {
            await onLogout();
          } catch (e) {
            setToast(e instanceof Error ? e.message : "Unable to sign out");
          }
        }}
      />
      <Header
        toggleNav={() => setNavOpen(!navOpen)}
        onCreate={() => setModal("Create report")}
        search={search}
        setSearch={setSearch}
      />
      <NavigationSidebar
        open={navOpen}
        close={() => setNavOpen(false)}
        active={active}
        onSelect={selectNav}
        customers={navCustomers}
        customReports={customReports}
      />
      {navOpen && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
        />
      )}
      <main
        className={`main-content ${loading && data ? "refreshing" : ""}`}
        aria-busy={loading}
      >
        {error ? (
          <div className="status-screen">
            <AlertCircle />
            <h1>Couldn’t load your report</h1>
            <p>{error}</p>
            <button className="dark-button" onClick={() => setRetry(retry + 1)}>
              Try again
            </button>
          </div>
        ) : !viewData ? (
          <div className="status-screen">
            <LoaderCircle className="spinner" />
            <p>Putting your report together…</p>
          </div>
        ) : showAnalytics ? (
          <>
            <RevenueHeader
              data={viewData}
              members={members}
              period={period}
              setPeriod={setPeriod}
              employee={employee}
              setEmployee={setEmployee}
              onDetails={() => setModal("Revenue details")}
              onExport={exportReport}
              onShare={share}
              title={title}
            />
            <div className="analytics-grid">
              <div className="left-analytics">
                <SalesOverview
                  platforms={viewData.platforms}
                  selected={platform}
                  onSelect={setPlatform}
                />
                <RevenueChart
                  period={period}
                  employee={employee}
                  platform={viewData.platforms.find((p) => p.name === platform)}
                />
              </div>
              <TeamPerformance
                team={viewData.team}
                period={period}
                search={search}
              />
            </div>
            <RecentDealsPanel
              deals={viewData.deals}
              onCustomer={selectNav}
            />
          </>
        ) : (
          <WorkspaceViews
            view={active}
            data={viewData}
            onSelectEmployee={setEmployee}
            onNavigate={selectNav}
            onCreate={() => setModal("Create report")}
          />
        )}
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
      <dialog
        ref={dialogRef}
        onCancel={() => setModal("")}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModal("");
        }}
      >
        <button
          className="dialog-close"
          aria-label="Close dialog"
          onClick={() => setModal("")}
        >
          <X size={20} />
        </button>
        <h2>{modal}</h2>
        {modal === "Create report" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const name = String(form.get("name")).trim();
              if (!name) return;
              setCustomReports((list) =>
                list.includes(name) ? list : [...list, name],
              );
              setTitle(name);
              setActive(name);
              setModal("");
              setToast("Report created");
            }}
          >
            <label>
              Report name
              <input
                name="name"
                placeholder="Quarterly sales report"
                required
                maxLength={60}
              />
            </label>
            <p>
              Create a named report view of the current sales data. It appears
              under My reports.
            </p>
            <button className="dark-button">Create report</button>
          </form>
        ) : modal === "Create dashboard" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const name = String(form.get("name")).trim();
              if (!name) return;
              const exists = navCustomers.some(
                (c) => c.name.toLowerCase() === name.toLowerCase(),
              );
              if (!exists) {
                const id = nextAccountId.current--;
                setCustomAccounts((list) => [
                  ...list,
                  { id, name, revenue: 0, deals: 0, lost: 0 },
                ]);
              }
              setActive(name);
              setModal("");
              setToast(
                exists
                  ? "Opened existing account dashboard"
                  : "Dashboard created",
              );
            }}
          >
            <label>
              Account name
              <input
                name="name"
                placeholder="Acme Trading"
                required
                maxLength={60}
              />
            </label>
            <p>
              Create an account dashboard under Dashboard → Accounts. Deals for
              this account come from the sales database when available.
            </p>
            <button className="dark-button">Create dashboard</button>
          </form>
        ) : modal === "Revenue details" ? (
          <>
            <p>Completed deals in the selected timeframe.</p>
            {data?.team.map((p) => (
              <div className="detail-row" key={p.id}>
                <span>{p.name}</span>
                <strong>{money(p.revenue, 2)}</strong>
              </div>
            ))}
            <button className="dark-button" onClick={exportReport}>
              Export CSV
            </button>
          </>
        ) : modal === "Settings" ? (
          <>
            <p>
              Signed in as <strong>{user.email}</strong>
            </p>
            <p>{user.name}</p>
            <button
              className="dark-button"
              onClick={async () => {
                try {
                  await onLogout();
                } catch (e) {
                  setToast(
                    e instanceof Error ? e.message : "Unable to sign out",
                  );
                }
              }}
            >
              Sign out
            </button>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
