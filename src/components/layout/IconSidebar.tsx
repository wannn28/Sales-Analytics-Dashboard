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
export function IconSidebar({
  onAction,
  onLogout,
}: {
  onAction: (name: string) => void;
  onLogout: () => void;
}) {
  return (
    <aside className="icon-sidebar" aria-label="Application">
      <a className="brand-link" href="#" aria-label="Codename home">
        <Brand />
      </a>
      <div className="rail-links">
        {[
          [House, "Home"],
          [LayoutDashboard, "Sales analytics"],
          [FileText, "Reports"],
          [Workflow, "Team"],
          [PencilRuler, "Workspace"],
        ].map(([Icon, label]) => {
          const Component = Icon as typeof House;
          return (
            <button
              key={String(label)}
              className={`rail-button ${label === "Sales analytics" ? "active" : ""}`}
              aria-label={String(label)}
              title={String(label)}
              onClick={() => onAction(String(label))}
            >
              <Component size={20} />
            </button>
          );
        })}
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
          className="rail-button notification"
          aria-label="Notifications"
          onClick={() => onAction("Notifications")}
        >
          <Bell size={19} />
          <i />
        </button>
        <button
          className="rail-button"
          aria-label="Settings"
          onClick={() => onAction("Settings")}
        >
          <Settings size={20} />
        </button>
      </div>
    </aside>
  );
}
