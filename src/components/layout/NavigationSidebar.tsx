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
export function NavigationSidebar({
  open,
  close,
  active,
  onSelect,
}: {
  open: boolean;
  close: () => void;
  active: string;
  onSelect: (name: string) => void;
}) {
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [sharedOpen, setSharedOpen] = useState(true);
  const [reportsOpen, setReportsOpen] = useState(true);
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
          {item("Codename")}
          <div className="nav-heading">
            <button
              className="nav-section-toggle"
              onClick={() => setSharedOpen(!sharedOpen)}
              aria-expanded={sharedOpen}
            >
              {sharedOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}{" "}
              Shared with me
            </button>
          </div>
          {sharedOpen && (
            <div className="nav-tree">
              {item("Cargo2go")}
              {item("Cloud3r", "2")}
              {item("Idioma")}
              {item("Syllables")}
              {item("x-0b")}
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
      {reportsOpen && (
        <div className="nav-tree">
          <div className="nav-heading">
            <button
              className="nav-section-toggle"
              onClick={() => setReportsOpen(!reportsOpen)}
              aria-expanded={reportsOpen}
            >
              {reportsOpen ? (
                <ChevronUp size={11} />
              ) : (
                <ChevronDown size={11} />
              )}{" "}
              Share with me
            </button>
          </div>
          {reportsOpen && (
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
              {item("Emails received")}
              {item("Deal duration report")}
              {item("New report")}
              {item("Analytics", "7")}
            </>
          )}
        </div>
      )}
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
