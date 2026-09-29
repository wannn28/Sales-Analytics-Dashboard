import { Star, History, Plus, ChevronUp, Link, X } from "lucide-react";
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
        Dashboard
        <button
          aria-label="Add dashboard"
          onClick={() => onSelect("Create report")}
        >
          <Plus size={13} />
        </button>
      </div>
      <div className="nav-tree">
        {item("Codename")}
        <div className="nav-heading">
          Shared with me
          <ChevronUp size={11} />
        </div>
        <div className="nav-tree">
          {item("Cargo2go")}
          {item("Cloud3r", "2")}
          {item("Idioma")}
          {item("Syllables")}
          {item("x-0b")}
        </div>
      </div>
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
          Share with me
          <ChevronUp size={11} />
        </div>
        <div className="nav-tree">
          {item("Deals by user")}
          {item("Deal duration")}
        </div>
        <div className="nav-heading">
          My reports
          <ChevronUp size={11} />
        </div>
        {item("Emails received")}
        {item("Deal duration report")}
        {item("New report")}
        {item("Analytics", "7")}
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
