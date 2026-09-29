import { Avatar, money, PlatformIcon } from "./ui";
import type {
  Customer,
  DashboardData,
  Employee,
  Notification,
} from "../types/dashboard";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel-empty">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="panel-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function SalesListView({
  team,
  onSelect,
}: {
  team: Employee[];
  onSelect: (id: number) => void;
}) {
  if (!team.length)
    return (
      <EmptyState
        title="No sales yet"
        body="Won deals for this period will show up here."
      />
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Sales list"
        subtitle="Won deals by salesperson in the selected timeframe."
      />
      <div className="panel-list">
        {team.map((person) => (
          <button
            className="panel-row"
            key={person.id}
            onClick={() => onSelect(person.id)}
          >
            <span className="panel-row-main">
              <Avatar person={person} small />
              {person.name}
            </span>
            <strong>
              {person.deals} deals · {money(person.revenue, 0)}
            </strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function GoalsView({ team }: { team: Employee[] }) {
  if (!team.length)
    return (
      <EmptyState
        title="No goals to track"
        body="Team revenue for this period will appear here once deals close."
      />
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Goals"
        subtitle="Progress toward the 2023 revenue goal, calculated from live report data."
      />
      <div className="panel-list">
        {team.map((person) => (
          <div className="goal-row panel-goal" key={person.id}>
            <span>
              {person.name}
              <small>{person.kpi.toFixed(2)} KPI</small>
            </span>
            <b>
              <i style={{ width: `${Math.min(100, person.revenue / 2500)}%` }} />
            </b>
            <strong>{money(person.revenue)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamView({
  team,
  onSelect,
}: {
  team: Employee[];
  onSelect: (id: number) => void;
}) {
  if (!team.length)
    return (
      <EmptyState
        title="No team members"
        body="Salespeople from the database will appear in this view."
      />
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Team"
        subtitle="Sales team performance from the current reporting window."
      />
      <div className="panel-cards">
        {team.map((person) => (
          <button
            className="panel-person"
            key={person.id}
            onClick={() => onSelect(person.id)}
          >
            <Avatar person={person} />
            <div>
              <strong>{person.name}</strong>
              <span>
                {person.deals} deals · {person.winRate.toFixed(0)}% win rate
              </span>
            </div>
            <b>{money(person.revenue, 0)}</b>
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkspaceView({
  customers,
  platforms,
  onCustomer,
}: {
  customers: Customer[];
  platforms: DashboardData["platforms"];
  onCustomer: (name: string) => void;
}) {
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Workspace"
        subtitle="Accounts and acquisition channels connected to your sales database."
      />
      <h2 className="panel-section-title">Accounts</h2>
      {customers.length ? (
        <div className="panel-list">
          {customers.map((customer) => (
            <button
              className="panel-row"
              key={customer.id}
              onClick={() => onCustomer(customer.name)}
            >
              <span>{customer.name}</span>
              <strong>
                {customer.deals} deals · {money(customer.revenue, 0)}
              </strong>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No accounts yet"
          body="Customer accounts from the database will show up here."
        />
      )}
      <h2 className="panel-section-title">Platforms</h2>
      {platforms.length ? (
        <div className="panel-list">
          {platforms.map((platform) => (
            <div className="panel-row static" key={platform.id}>
              <span className="panel-row-main">
                <PlatformIcon name={platform.name} />
                {platform.name}
              </span>
              <strong>
                {platform.deals} deals · {money(platform.revenue, 0)}
              </strong>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No platforms yet"
          body="Acquisition platforms will appear once deals are recorded."
        />
      )}
    </section>
  );
}

function NotificationsView({ items }: { items: Notification[] }) {
  if (!items.length)
    return (
      <section className="workspace-panel">
        <PanelHeader
          title="Notifications"
          subtitle="Deal activity from the current reporting window."
        />
        <EmptyState
          title="You're all caught up"
          body="No new deal notifications for this period."
        />
      </section>
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Notifications"
        subtitle="Recent closed deals from the sales database."
      />
      <div className="panel-list">
        {items.map((item) => (
          <div className="panel-row static notification-row" key={item.id}>
            <span>
              <strong>{item.title}</strong>
              <small>
                {item.body} · {item.closedAt}
              </small>
            </span>
            <b>{money(item.amount, 0)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function CustomerView({ customer }: { customer: Customer | undefined }) {
  if (!customer)
    return (
      <EmptyState
        title="Account not found"
        body="This account is not in the current sales database."
      />
    );
  if (!customer.deals && !customer.lost)
    return (
      <section className="workspace-panel">
        <PanelHeader
          title={customer.name}
          subtitle="Account dashboard from the sales database."
        />
        <EmptyState
          title="No deals yet"
          body={`No deals recorded for ${customer.name} in this period.`}
        />
      </section>
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title={customer.name}
        subtitle="Account dashboard from the sales database."
      />
      <div className="panel-stats">
        <div>
          <label>Revenue</label>
          <strong>{money(customer.revenue, 2)}</strong>
        </div>
        <div>
          <label>Won deals</label>
          <strong>{customer.deals}</strong>
        </div>
        <div>
          <label>Lost deals</label>
          <strong>{customer.lost}</strong>
        </div>
      </div>
    </section>
  );
}

function DealStatsView({
  title,
  data,
}: {
  title: string;
  data: DashboardData;
}) {
  return (
    <section className="workspace-panel">
      <PanelHeader
        title={title}
        subtitle="Average deal value and volume for the selected period."
      />
      <div className="panel-list">
        <div className="panel-row static">
          <span>Average deal value</span>
          <strong>{money(data.summary.averageValue, 2)}</strong>
        </div>
        <div className="panel-row static">
          <span>Won deals</span>
          <strong>{data.summary.deals}</strong>
        </div>
        <div className="panel-row static">
          <span>Win rate</span>
          <strong>{data.summary.winRate.toFixed(0)}%</strong>
        </div>
        <div className="panel-row static">
          <span>Best deal</span>
          <strong>
            {money(data.summary.bestDeal, 0)} · {data.summary.bestCustomer}
          </strong>
        </div>
      </div>
    </section>
  );
}

function PlatformRevenueView({ data }: { data: DashboardData }) {
  if (!data.platforms.length)
    return (
      <EmptyState
        title="No platform revenue"
        body="Platform totals will appear once deals are recorded."
      />
    );
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Platform revenue"
        subtitle="Won revenue by acquisition channel for the selected period."
      />
      <div className="panel-list">
        {data.platforms.map((platform) => (
          <div className="panel-row static" key={platform.id}>
            <span className="panel-row-main">
              <PlatformIcon name={platform.name} />
              {platform.name}
            </span>
            <strong>
              {platform.share.toFixed(1)}% · {money(platform.revenue, 0)}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportsIndexView({
  reports,
  onSelect,
}: {
  reports: string[];
  onSelect: (name: string) => void;
}) {
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Reports"
        subtitle="Open a report view built from the current sales database."
      />
      <div className="panel-list">
        {reports.map((report) => (
          <button
            className="panel-row"
            key={report}
            onClick={() => onSelect(report)}
          >
            <span>{report}</span>
            <strong>Open</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function FolderView({
  title,
  reports,
  revenue,
  onSelect,
  onCreate,
}: {
  title: string;
  reports: string[];
  revenue: number;
  onSelect: (name: string) => void;
  onCreate?: () => void;
}) {
  return (
    <section className="workspace-panel">
      <PanelHeader
        title={title}
        subtitle={
          title === "Manage folders"
            ? "Organize report views in your iQuee workspace."
            : `${title} built from your current report views.`
        }
      />
      <div className="panel-list">
        {reports.map((report) => (
          <button
            className="panel-row"
            key={report}
            onClick={() => onSelect(report)}
          >
            <span>{report}</span>
            <strong>{money(revenue, 0)}</strong>
          </button>
        ))}
      </div>
      {onCreate && (
        <button className="dark-button panel-action" onClick={onCreate}>
          Add folder
        </button>
      )}
    </section>
  );
}

function HomeView({
  data,
  onOpen,
}: {
  data: DashboardData;
  onOpen: (name: string) => void;
}) {
  return (
    <section className="workspace-panel">
      <PanelHeader
        title="Home"
        subtitle="A snapshot of revenue, team, and accounts from the sales database."
      />
      <div className="panel-stats">
        <div>
          <label>Revenue</label>
          <strong>{money(data.summary.revenue, 0)}</strong>
        </div>
        <div>
          <label>Won deals</label>
          <strong>{data.summary.deals}</strong>
        </div>
        <div>
          <label>Win rate</label>
          <strong>{data.summary.winRate.toFixed(0)}%</strong>
        </div>
        <div>
          <label>Top account</label>
          <strong>{data.summary.bestCustomer}</strong>
        </div>
      </div>
      <h2 className="panel-section-title">Quick open</h2>
      <div className="panel-list">
        {["Sales analytics", "Team", "Workspace", "Sales list", "Goals"].map(
          (item) => (
            <button
              className="panel-row"
              key={item}
              onClick={() => onOpen(item)}
            >
              <span>{item}</span>
              <strong>Open</strong>
            </button>
          ),
        )}
      </div>
    </section>
  );
}

export function WorkspaceViews({
  view,
  data,
  onSelectEmployee,
  onNavigate,
  onCreate,
}: {
  view: string;
  data: DashboardData;
  onSelectEmployee: (id: number) => void;
  onNavigate: (name: string) => void;
  onCreate: () => void;
}) {
  const customer = data.customers.find((c) => c.name === view);
  const reportList = [
    "Deals by user",
    "Deal duration",
    "Platform revenue",
    "Deal duration report",
    "New report",
    "Analytics",
  ];

  if (view === "Home") return <HomeView data={data} onOpen={onNavigate} />;
  if (view === "Team")
    return (
      <TeamView
        team={data.team}
        onSelect={(id) => {
          onSelectEmployee(id);
          onNavigate("Sales analytics");
        }}
      />
    );
  if (view === "Workspace")
    return (
      <WorkspaceView
        customers={data.customers}
        platforms={data.platforms}
        onCustomer={onNavigate}
      />
    );
  if (view === "Notifications")
    return <NotificationsView items={data.notifications} />;
  if (view === "Sales list" || view === "Deals by user")
    return (
      <SalesListView
        team={data.team}
        onSelect={(id) => {
          onSelectEmployee(id);
          onNavigate("Sales analytics");
        }}
      />
    );
  if (view === "Goals") return <GoalsView team={data.team} />;
  if (view === "Deal duration" || view === "Deal duration report")
    return <DealStatsView title={view} data={data} />;
  if (view === "Platform revenue")
    return <PlatformRevenueView data={data} />;
  if (view === "Reports")
    return <ReportsIndexView reports={reportList} onSelect={onNavigate} />;
  if (
    view === "Recent reports" ||
    view === "Starred reports" ||
    view === "Manage folders"
  )
    return (
      <FolderView
        title={view}
        reports={["New report", "Analytics", "Team"]}
        revenue={data.summary.revenue}
        onSelect={onNavigate}
        onCreate={view === "Manage folders" ? onCreate : undefined}
      />
    );
  if (customer) return <CustomerView customer={customer} />;

  return (
    <EmptyState
      title={view}
      body="No matching records for this section in the current sales database."
    />
  );
}
