import { useEffect, useRef, useState } from "react";
import { X, LoaderCircle, Check, AlertCircle } from "lucide-react";
import { Header } from "../components/layout/Header";
import { IconSidebar } from "../components/layout/IconSidebar";
import { NavigationSidebar } from "../components/layout/NavigationSidebar";
import { RevenueHeader } from "../components/dashboard/RevenueHeader";
import { SalesOverview } from "../components/dashboard/SalesOverview";
import { RevenueChart } from "../components/dashboard/RevenueChart";
import { TeamPerformance } from "../components/dashboard/TeamPerformance";
import { money } from "../components/ui";
import { loadDashboard } from "../services/api";
import type { DashboardData, Employee } from "../types/dashboard";
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
  const [active, setActive] = useState("New report");
  const [title, setTitle] = useState("New report");
  const [modal, setModal] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
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
  const selectNav = (name: string) => {
    if (
      [
        "New report",
        "Analytics",
        "Codename",
        "Sales analytics",
        "Home",
        "Reports",
      ].includes(name)
    ) {
      setActive(name);
      setTitle(name === "Analytics" ? "Analytics" : "New report");
    } else setModal(name);
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
  return (
    <div className="app-shell">
      <IconSidebar
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
        ) : !data ? (
          <div className="status-screen">
            <LoaderCircle className="spinner" />
            <p>Putting your report together…</p>
          </div>
        ) : (
          <>
            <RevenueHeader
              data={data}
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
                  platforms={data.platforms}
                  selected={platform}
                  onSelect={setPlatform}
                />
                <RevenueChart
                  period={period}
                  employee={employee}
                  platform={data.platforms.find((p) => p.name === platform)}
                />
              </div>
              <TeamPerformance
                team={data.team}
                period={period}
                search={search}
              />
            </div>
          </>
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
              setTitle(String(form.get("name")));
              setModal("");
              setToast("Report view created");
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
              Create a named view of the current sales data. Export it to save a
              copy.
            </p>
            <button className="dark-button">Create report</button>
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
          <><p>Signed in as <strong>{user.email}</strong></p><p>{user.name}</p><button className="dark-button" onClick={async()=>{try{await onLogout();}catch(e){setToast(e instanceof Error?e.message:'Unable to sign out');}}}>Sign out</button></>
        ) : modal === "Notifications" ? (
          <p>
            You’re all caught up. Your report is connected to the sales
            database.
          </p>
        ) : (
          <>
            <p>
              This demo includes the Sales Analytics report. Other workspace
              sections don’t have data yet.
            </p>
            <button className="dark-button" onClick={() => setModal("")}>
              Back to report
            </button>
          </>
        )}
      </dialog>
    </div>
  );
}
