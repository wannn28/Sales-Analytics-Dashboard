import {
  House,
  LayoutDashboard,
  FileText,
  Workflow,
  PencilRuler,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { Brand } from "../ui";

const RAIL_ITEMS = [
  [House, "Home"],
  [LayoutDashboard, "Sales analytics"],
  [FileText, "Reports"],
  [Workflow, "Team"],
  [PencilRuler, "Workspace"],
] as const;

export function IconSidebar({
  active,
  onAction,
  onLogout,
  hasNotifications,
}: {
  active: string;
  onAction: (name: string) => void;
  onLogout: () => void;
  hasNotifications: boolean;
}) {
  const railActive =
    active === "Home" ||
    active === "Sales analytics" ||
    active === "Reports" ||
    active === "Team" ||
    active === "Workspace"
      ? active
      : active === "iQuee" ||
          active === "New report" ||
          active === "Analytics"
        ? "Sales analytics"
        : "";
  return (
    <aside className="icon-sidebar" aria-label="Application">
      <a
        className="brand-link"
        href="#"
        aria-label="iQuee home"
        onClick={(e) => {
          e.preventDefault();
          onAction("Home");
        }}
      >
        <Brand />
      </a>
      <div className="rail-links">
        {RAIL_ITEMS.map(([Icon, label]) => (
          <button
            key={label}
            className={`rail-button ${railActive === label ? "active" : ""}`}
            aria-label={label}
            title={label}
            onClick={() => onAction(label)}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
      <div className="rail-bottom">
        <button
          className="rail-button"
          aria-label="Sign out"
          title="Sign out"
          onClick={onLogout}
        >
          <LogOut size={19} />
        </button>
        <button
          className={`rail-button notification ${active === "Notifications" ? "active" : ""}`}
          aria-label="Notifications"
          title="Notifications"
          onClick={() => onAction("Notifications")}
        >
          <Bell size={19} />
          {hasNotifications && <i />}
        </button>
        <button
          className="rail-button"
          aria-label="Settings"
          title="Settings"
          onClick={() => onAction("Settings")}
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
