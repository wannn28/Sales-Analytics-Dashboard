import { useState } from "react";
import {
  Star,
  History,
  Plus,
  ChevronDown,
  ChevronRight,
  Link,
  X,
} from "lucide-react";
import type { Customer } from "../../types/dashboard";

function SectionHeading({
  label,
  open,
  onToggle,
  onAdd,
  addLabel,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <div className="nav-heading">
      <button
        type="button"
        className="nav-section-toggle"
        onClick={onToggle}
        aria-expanded={open}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span>{label}</span>
      </button>
      {onAdd && (
        <button
          type="button"
          className="nav-add"
          aria-label={addLabel ?? `Add ${label.toLowerCase()}`}
          title={addLabel ?? `Add ${label.toLowerCase()}`}
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <Plus size={13} />
        </button>
      )}
    </div>
  );
}

export function NavigationSidebar({
  open,
  close,
  active,
  onSelect,
  customers,
  customReports = [],
}: {
  open: boolean;
  close: () => void;
  active: string;
  onSelect: (name: string) => void;
  customers: Customer[];
  customReports?: string[];
}) {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
  const [sharedReportsOpen, setSharedReportsOpen] = useState(true);
  const [myReportsOpen, setMyReportsOpen] = useState(true);

  const item = (label: string, badge?: string) => (
    <button
      key={label}
      type="button"
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
        type="button"
        className="mobile-close"
        onClick={close}
        aria-label="Close navigation"
      >
        <X size={18} />
      </button>
      <div className="quick-links">
        <button type="button" onClick={() => onSelect("Starred reports")}>
          <Star size={12} />
          Starred
        </button>
        <button type="button" onClick={() => onSelect("Recent reports")}>
          <History size={12} />
          Recent
        </button>
      </div>
      {item("Sales list")}
      {item("Goals")}

      <SectionHeading
        label="Dashboard"
        open={dashboardOpen}
        onToggle={() => setDashboardOpen(!dashboardOpen)}
        onAdd={() => onSelect("Create dashboard")}
        addLabel="Create dashboard"
      />
      {dashboardOpen && (
        <div className="nav-tree">
          {item("All accounts")}
          <SectionHeading
            label="Accounts"
            open={accountsOpen}
            onToggle={() => setAccountsOpen(!accountsOpen)}
          />
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

      <SectionHeading
        label="Reports"
        open={reportsOpen}
        onToggle={() => setReportsOpen(!reportsOpen)}
        onAdd={() => onSelect("Create report")}
        addLabel="Create report"
      />
      {reportsOpen && (
        <div className="nav-tree">
          <SectionHeading
            label="Team reports"
            open={sharedReportsOpen}
            onToggle={() => setSharedReportsOpen(!sharedReportsOpen)}
          />
          {sharedReportsOpen && (
            <div className="nav-tree">
              {item("Deals by user")}
              {item("Deal duration")}
            </div>
          )}
          <SectionHeading
            label="My reports"
            open={myReportsOpen}
            onToggle={() => setMyReportsOpen(!myReportsOpen)}
          />
          {myReportsOpen && (
            <>
              {item("Platform revenue")}
              {item("Deal duration report")}
              {item("New report")}
              {item("Analytics", String(Math.min(7, customers.length || 7)))}
              {customReports.map((name) => item(name))}
            </>
          )}
        </div>
      )}

      <button
        type="button"
        className="manage-folders"
        onClick={() => onSelect("Manage folders")}
      >
        <Link size={12} />
        Manage folders
      </button>
    </aside>
  );
}
