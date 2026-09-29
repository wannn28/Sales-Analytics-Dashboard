import { useState } from "react";
import {
  Star,
  History,
  Plus,
  ChevronUp,
  ChevronDown,
  Link,
  X,
} from "lucide-react";
import type { Customer } from "../../types/dashboard";

export function NavigationSidebar({
  open,
  close,
  active,
  onSelect,
  customers,
}: {
  open: boolean;
  close: () => void;
  active: string;
  onSelect: (name: string) => void;
  customers: Customer[];
}) {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [sharedReportsOpen, setSharedReportsOpen] = useState(true);
  const [myReportsOpen, setMyReportsOpen] = useState(true);
  const item = (label: string, badge?: string) => (
    <button
      key={label}
      className={`nav-item ${active === label ? "selected" : ""}`}
      onClick={() => {
        onSelect(label);
        close();
      }}
    >
      {label}
      {badge && <b>{badge}</b>}
    </button>
  );
  return (
    <aside
      className={`navigation ${open ? "open" : ""}`}
      aria-label="Reports navigation"
    >
      <button
        className="mobile-close"
        onClick={close}
        aria-label="Close navigation"
      >
        <X size={18} />
      </button>
      <div className="quick-links">
        <button onClick={() => onSelect("Starred reports")}>
          <Star size={12} />
          Starred
        </button>
        <button onClick={() => onSelect("Recent reports")}>
          <History size={12} />
          Recent
        </button>
      </div>
      {item("Sales list")}
      {item("Goals")}
      <div className="nav-heading">
        <button
          className="nav-section-toggle"
          onClick={() => setDashboardOpen(!dashboardOpen)}
          aria-expanded={dashboardOpen}
        >
          {dashboardOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}{" "}
          Dashboard
        </button>
        <button
          aria-label="Add dashboard"
          onClick={() => onSelect("Create report")}
        >
          <Plus size={13} />
        </button>
      </div>
      {dashboardOpen && (
        <div className="nav-tree">
          {item("iQuee")}
          <div className="nav-heading">
            <button
              className="nav-section-toggle"
              onClick={() => setAccountsOpen(!accountsOpen)}
              aria-expanded={accountsOpen}
            >
              {accountsOpen ? (
                <ChevronUp size={11} />
              ) : (
                <ChevronDown size={11} />
              )}{" "}
              Accounts
            </button>
          </div>
          {accountsOpen && (
            <div className="nav-tree">
              {customers.length ? (
                customers.map((customer) =>
                  item(
                    customer.name,
                    customer.deals > 0 ? String(customer.deals) : undefined,
                  ),
                )
              ) : (
                <p className="nav-empty">No accounts yet</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="nav-heading">
        Reports
        <button
          aria-label="Add report"
          onClick={() => onSelect("Create report")}
        >
          <Plus size={13} />
        </button>
      </div>
      <div className="nav-tree">
        <div className="nav-heading">
          <button
            className="nav-section-toggle"
            onClick={() => setSharedReportsOpen(!sharedReportsOpen)}
            aria-expanded={sharedReportsOpen}
          >
            {sharedReportsOpen ? (
              <ChevronUp size={11} />
            ) : (
              <ChevronDown size={11} />
            )}{" "}
            Team reports
          </button>
        </div>
        {sharedReportsOpen && (
          <div className="nav-tree">
            {item("Deals by user")}
            {item("Deal duration")}
          </div>
        )}
        <div className="nav-heading">
          <button
            className="nav-section-toggle"
            onClick={() => setMyReportsOpen(!myReportsOpen)}
            aria-expanded={myReportsOpen}
          >
            {myReportsOpen ? (
              <ChevronUp size={11} />
            ) : (
              <ChevronDown size={11} />
            )}{" "}
            My reports
          </button>
        </div>
        {myReportsOpen && (
          <>
            {item("Platform revenue")}
            {item("Deal duration report")}
            {item("New report")}
            {item("Analytics", String(Math.min(7, customers.length || 7)))}
          </>
        )}
      </div>
      <button
        className="manage-folders"
        onClick={() => onSelect("Manage folders")}
      >
        <Link size={12} />
        Manage folders
      </button>
    </aside>
  );
}
