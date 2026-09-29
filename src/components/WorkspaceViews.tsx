import { useMemo, useState, type ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Avatar, money, PlatformIcon } from "./ui";
import type {
  Customer,
  DashboardData,
  Deal,
  Employee,
  Notification,
} from "../types/dashboard";

type StatusFilter = "all" | "won" | "lost";
type SurfaceMode = "list" | "board";

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="panel-empty">
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

/** HubSpot/Pipedrive-style chrome: title row + list/board + filter presets */
function RecordChrome({
  title,
  subtitle,
  mode,
  onMode,
  status,
  onStatus,
  counts,
  extra,
}: {
  title: string;
  subtitle?: string;
  mode?: SurfaceMode;
  onMode?: (m: SurfaceMode) => void;
  status: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  counts: { all: number; won: number; lost: number };
  extra?: ReactNode;
}) {
  return (
    <div className="crm-chrome">
      <div className="crm-chrome-top">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {mode && onMode && (
          <div className="view-switch" role="tablist" aria-label="View mode">
            <button
              role="tab"
              aria-selected={mode === "list"}
              className={mode === "list" ? "active" : ""}
              onClick={() => onMode("list")}
            >
              <List size={14} /> List
            </button>
            <button
              role="tab"
              aria-selected={mode === "board"}
              className={mode === "board" ? "active" : ""}
              onClick={() => onMode("board")}
            >
              <LayoutGrid size={14} /> Board
            </button>
          </div>
        )}
      </div>
      <div className="crm-toolbar">
        <div className="preset-filters" role="tablist" aria-label="Deal filters">
          {(
            [
              ["all", "All deals", counts.all],
              ["won", "Closed won", counts.won],
              ["lost", "Closed lost", counts.lost],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              role="tab"
              aria-selected={status === key}
              className={status === key ? "active" : ""}
              onClick={() => onStatus(key)}
            >
              {label}
              <b>{count}</b>
            </button>
          ))}
        </div>
        {extra}
      </div>
    </div>
  );
}

function MetricsBar({
  items,
}: {
  items: { label: string; value: string; hint?: string }[];
}) {
  return (
    <div className="metrics-bar" aria-label="View metrics">
      {items.map((item) => (
        <div key={item.label} className="metric-cell">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.hint && <em>{item.hint}</em>}
        </div>
      ))}
    </div>
  );
}

function DealTable({
  deals,
  onCustomer,
  onOwner,
  showCustomer = true,
  compact = false,
}: {
  deals: Deal[];
  onCustomer?: (name: string) => void;
  onOwner?: (id: number) => void;
  showCustomer?: boolean;
  compact?: boolean;
}) {
  if (!deals.length)
    return (
      <EmptyState
        title="No deals in this filter"
        body="Try another status or timeframe. Rows come from the sales database."
      />
    );
  return (
    <div className={`deal-table-wrap ${compact ? "compact" : "bleed"}`}>
      <table className="deal-table">
        <thead>
          <tr>
            {showCustomer && <th>Account</th>}
            <th>Owner</th>
            <th>Platform</th>
            <th className="num">Amount</th>
            <th>Status</th>
            <th>Close date</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => (
            <tr key={deal.id}>
              {showCustomer && (
                <td>
                  {onCustomer ? (
                    <button
                      className="linkish"
                      onClick={() => onCustomer(deal.customer)}
                    >
                      {deal.customer}
                    </button>
                  ) : (
                    deal.customer
                  )}
                </td>
              )}
              <td>
                <button
                  className="owner-cell"
                  onClick={() => onOwner?.(deal.employeeId)}
                  disabled={!onOwner}
                >
                  <Avatar
                    person={{
                      name: deal.employee,
                      initials: deal.employeeInitials,
                      color: deal.employeeColor,
                    }}
                    small
                  />
                  {deal.employee}
                </button>
              </td>
              <td>
                <span className="platform-cell">
                  <PlatformIcon name={deal.platform} />
                  {deal.platform}
                </span>
              </td>
              <td className="num">{money(deal.amount, 0)}</td>
              <td>
                <span className={`status-pill ${deal.status}`}>
                  {deal.status === "won"
                    ? "Closed won"
                    : deal.status === "lost"
                      ? "Closed lost"
                      : deal.status}
                </span>
              </td>
              <td className="muted">{deal.closedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Pipedrive/Close/Attio-style horizontal stage columns */
function PipelineBoard({
  deals,
  onCustomer,
}: {
  deals: Deal[];
  onCustomer?: (name: string) => void;
}) {
  const columns = [
    {
      key: "won",
      label: "Closed won",
      rows: deals.filter((d) => d.status === "won"),
    },
    {
      key: "lost",
      label: "Closed lost",
      rows: deals.filter((d) => d.status === "lost"),
    },
  ];
  return (
    <div className="pipeline-board-full">
      {columns.map((col) => {
        const total = col.rows.reduce((n, d) => n + d.amount, 0);
        return (
          <section key={col.key} className={`pipeline-stage ${col.key}`}>
            <header>
              <div>
                <strong>{col.label}</strong>
                <span>{col.rows.length} deals</span>
              </div>
              <b>{money(total, 0)}</b>
            </header>
            <ul>
              {col.rows.map((deal) => (
                <li key={deal.id}>
                  <button
                    className="deal-card"
                    onClick={() => onCustomer?.(deal.customer)}
                  >
                    <strong>{deal.customer}</strong>
                    <span className="deal-card-meta">
                      <Avatar
                        person={{
                          name: deal.employee,
                          initials: deal.employeeInitials,
                          color: deal.employeeColor,
                        }}
                        small
                      />
                      {deal.employee}
                      <i>·</i>
                      <PlatformIcon name={deal.platform} />
                      {deal.platform}
                    </span>
                    <em>
                      {money(deal.amount, 0)}
                      <small>{deal.closedAt}</small>
                    </em>
                  </button>
                </li>
              ))}
              {!col.rows.length && (
                <li className="empty-col">No deals in this stage</li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** Close-style chronological activity rail */
function ActivityRail({ deals, title = "Activity" }: { deals: Deal[]; title?: string }) {
  if (!deals.length)
    return (
      <aside className="activity-rail">
        <h2>{title}</h2>
        <EmptyState
          title="No activity yet"
          body="Closed deals for this view will appear here."
        />
      </aside>
    );
  return (
    <aside className="activity-rail">
      <h2>{title}</h2>
      <ol>
        {deals.slice(0, 40).map((deal) => (
          <li key={deal.id}>
            <i className={deal.status} />
            <div>
              <strong>
                {deal.status === "won" ? "Deal won" : "Deal lost"} ·{" "}
                {deal.customer}
              </strong>
              <span>
                {deal.employee} · {deal.platform} · {deal.closedAt}
              </span>
            </div>
            <b>{money(deal.amount, 0)}</b>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function MiniTrend({ deals }: { deals: Deal[] }) {
  const points = useMemo(() => {
    const map = new Map<string, number>();
    for (const deal of deals) {
      if (deal.status !== "won") continue;
      const key = deal.closedAt.slice(0, 7);
      map.set(key, (map.get(key) ?? 0) + deal.amount);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, revenue]) => ({ label, revenue }));
  }, [deals]);
  if (!points.length)
    return (
      <div className="mini-trend empty">
        <p>No won revenue in this window.</p>
      </div>
    );
  return (
    <div className="mini-trend">
      <ResponsiveContainer width="100%" height={110}>
        <BarChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a8582" }} />
          <Tooltip formatter={(v) => money(Number(v), 0)} />
          <Bar dataKey="revenue" fill="#cf2b5f" radius={[5, 5, 2, 2]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function useDealFilter(deals: Deal[]) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const counts = useMemo(
    () => ({
      all: deals.length,
      won: deals.filter((d) => d.status === "won").length,
      lost: deals.filter((d) => d.status === "lost").length,
    }),
    [deals],
  );
  const filtered = useMemo(
    () => (status === "all" ? deals : deals.filter((d) => d.status === status)),
    [deals, status],
  );
  return { status, setStatus, counts, filtered };
}

function metricItems(deals: Deal[]) {
  const won = deals.filter((d) => d.status === "won");
  const lost = deals.filter((d) => d.status === "lost");
  const wonValue = won.reduce((n, d) => n + d.amount, 0);
  const avg = won.length ? wonValue / won.length : 0;
  const rate =
    won.length + lost.length
      ? (won.length / (won.length + lost.length)) * 100
      : 0;
  return [
    { label: "Total amount", value: money(wonValue, 0), hint: "Closed won" },
    { label: "Deals", value: String(deals.length) },
    { label: "Avg won deal", value: money(avg, 0) },
    { label: "Win rate", value: `${rate.toFixed(0)}%` },
  ];
}

function SalesListView({
  deals,
  team,
  onOwner,
  onCustomer,
}: {
  deals: Deal[];
  team: Employee[];
  onOwner: (id: number) => void;
  onCustomer: (name: string) => void;
}) {
  const { status, setStatus, counts, filtered } = useDealFilter(deals);
  const [mode, setMode] = useState<SurfaceMode>("list");
  const [owner, setOwner] = useState<number | null>(null);
  const rows = owner
    ? filtered.filter((d) => d.employeeId === owner)
    : filtered;
  if (!deals.length)
    return (
      <EmptyState
        title="No sales yet"
        body="Won and lost deals for this period will show up here."
      />
    );
  return (
    <section className="crm-screen">
      <RecordChrome
        title="Sales list"
        subtitle="List and board views of every closed deal in the selected timeframe."
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
        extra={
          <div className="owner-filter">
            <button
              className={!owner ? "active" : ""}
              onClick={() => setOwner(null)}
            >
              Everyone
            </button>
            {team.map((person) => (
              <button
                key={person.id}
                className={owner === person.id ? "active" : ""}
                onClick={() =>
                  setOwner(owner === person.id ? null : person.id)
                }
              >
                <Avatar person={person} small />
                {person.name.split(" ")[0]}
              </button>
            ))}
          </div>
        }
      />
      <MetricsBar items={metricItems(rows)} />
      {mode === "list" ? (
        <div className="crm-split">
          <DealTable
            deals={rows}
            onCustomer={onCustomer}
            onOwner={onOwner}
          />
          <ActivityRail deals={rows} title="Recent activity" />
        </div>
      ) : (
        <PipelineBoard deals={rows} onCustomer={onCustomer} />
      )}
    </section>
  );
}

function GoalsView({
  team,
  deals,
  onOwner,
}: {
  team: Employee[];
  deals: Deal[];
  onOwner: (id: number) => void;
}) {
  if (!team.length)
    return (
      <EmptyState
        title="No goals to track"
        body="Team revenue for this period will appear here once deals close."
      />
    );
  const target = Math.max(...team.map((p) => p.revenue), 1) * 1.15;
  return (
    <section className="crm-screen">
      <div className="crm-chrome">
        <div className="crm-chrome-top">
          <div>
            <h1>Goals</h1>
            <p>
              Progress toward period revenue targets with contributing deals.
            </p>
          </div>
        </div>
      </div>
      <div className="goals-grid">
        {team.map((person) => {
          const personDeals = deals.filter(
            (d) => d.employeeId === person.id && d.status === "won",
          );
          const pct = Math.min(100, (person.revenue / target) * 100);
          return (
            <article key={person.id} className="goal-card">
              <header>
                <button
                  className="owner-cell"
                  onClick={() => onOwner(person.id)}
                >
                  <Avatar person={person} />
                  <span>
                    <strong>{person.name}</strong>
                    <small>
                      {person.deals} closed won · {person.winRate.toFixed(0)}%
                      win rate
                    </small>
                  </span>
                </button>
                <b>{money(person.revenue, 0)}</b>
              </header>
              <div className="goal-meter">
                <i style={{ width: `${pct}%` }} />
              </div>
              <span className="goal-meta">
                {pct.toFixed(0)}% of {money(target, 0)} stretch · KPI{" "}
                {person.kpi.toFixed(2)}
              </span>
              <DealTable deals={personDeals.slice(0, 8)} showCustomer compact />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function TeamView({
  team,
  deals,
  onOwner,
  onCustomer,
}: {
  team: Employee[];
  deals: Deal[];
  onOwner: (id: number) => void;
  onCustomer: (name: string) => void;
}) {
  const [selected, setSelected] = useState(team[0]?.id ?? 0);
  const person = team.find((p) => p.id === selected) ?? team[0];
  const personDeals = deals.filter((d) => d.employeeId === person?.id);
  const { status, setStatus, counts, filtered } = useDealFilter(personDeals);
  if (!team.length)
    return (
      <EmptyState
        title="No team members"
        body="Salespeople from the database will appear in this view."
      />
    );
  return (
    <section className="crm-screen">
      <div className="crm-chrome">
        <div className="crm-chrome-top">
          <div>
            <h1>Team</h1>
            <p>Roster performance with live deal history per owner.</p>
          </div>
        </div>
      </div>
      <div className="crm-split team-split">
        <div className="deal-table-wrap bleed">
          <table className="deal-table">
            <thead>
              <tr>
                <th>Salesperson</th>
                <th className="num">Revenue</th>
                <th className="num">Closed won</th>
                <th className="num">Leads</th>
                <th className="num">KPI</th>
                <th className="num">Win rate</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr
                  key={member.id}
                  className={selected === member.id ? "selected-row" : ""}
                  onClick={() => {
                    setSelected(member.id);
                    onOwner(member.id);
                  }}
                >
                  <td>
                    <span className="owner-cell static">
                      <Avatar person={member} small />
                      {member.name}
                    </span>
                  </td>
                  <td className="num">{money(member.revenue, 0)}</td>
                  <td className="num">{member.deals}</td>
                  <td className="num">{member.leads}</td>
                  <td className="num">{member.kpi.toFixed(2)}</td>
                  <td className="num">{member.winRate.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="record-detail">
          <RecordChrome
            title={person?.name ?? "Member"}
            status={status}
            onStatus={setStatus}
            counts={counts}
          />
          <MetricsBar items={metricItems(filtered)} />
          <DealTable
            deals={filtered}
            onCustomer={onCustomer}
            showCustomer
            compact
          />
          <ActivityRail deals={filtered} />
        </div>
      </div>
    </section>
  );
}

function WorkspaceView({
  customers,
  platforms,
  deals,
  onCustomer,
}: {
  customers: Customer[];
  platforms: DashboardData["platforms"];
  deals: Deal[];
  onCustomer: (name: string) => void;
}) {
  const [mode, setMode] = useState<SurfaceMode>("list");
  const { status, setStatus, counts, filtered } = useDealFilter(deals);
  return (
    <section className="crm-screen">
      <RecordChrome
        title="Workspace"
        subtitle="Accounts, channels, and deal flow from the sales database."
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
      />
      <MetricsBar
        items={[
          { label: "Accounts", value: String(customers.length) },
          {
            label: "Account revenue",
            value: money(
              customers.reduce((n, c) => n + c.revenue, 0),
              0,
            ),
          },
          { label: "Platforms", value: String(platforms.length) },
          { label: "Deals shown", value: String(filtered.length) },
        ]}
      />
      {mode === "board" ? (
        <PipelineBoard deals={filtered} onCustomer={onCustomer} />
      ) : (
        <div className="crm-split">
          <div className="stack-tables">
            <h2 className="section-label">Accounts</h2>
            <div className="deal-table-wrap bleed">
              <table className="deal-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th className="num">Revenue</th>
                    <th className="num">Won</th>
                    <th className="num">Lost</th>
                    <th className="num">Win rate</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const total = customer.deals + customer.lost;
                    const rate = total
                      ? (customer.deals / total) * 100
                      : 0;
                    return (
                      <tr
                        key={customer.id}
                        className="click-row"
                        onClick={() => onCustomer(customer.name)}
                      >
                        <td>{customer.name}</td>
                        <td className="num">{money(customer.revenue, 0)}</td>
                        <td className="num">{customer.deals}</td>
                        <td className="num">{customer.lost}</td>
                        <td className="num">{rate.toFixed(0)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <h2 className="section-label">Platforms</h2>
            <div className="deal-table-wrap bleed compact">
              <table className="deal-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th className="num">Revenue</th>
                    <th className="num">Deals</th>
                    <th className="num">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map((platform) => (
                    <tr key={platform.id}>
                      <td>
                        <span className="platform-cell">
                          <PlatformIcon name={platform.name} />
                          {platform.name}
                        </span>
                      </td>
                      <td className="num">{money(platform.revenue, 0)}</td>
                      <td className="num">{platform.deals}</td>
                      <td className="num">{platform.share.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ActivityRail deals={filtered} />
        </div>
      )}
    </section>
  );
}

function NotificationsView({ items }: { items: Notification[] }) {
  if (!items.length)
    return (
      <section className="crm-screen">
        <div className="crm-chrome">
          <div className="crm-chrome-top">
            <div>
              <h1>Notifications</h1>
              <p>Deal activity from the current reporting window.</p>
            </div>
          </div>
        </div>
        <EmptyState
          title="You're all caught up"
          body="No new deal notifications for this period."
        />
      </section>
    );
  return (
    <section className="crm-screen">
      <div className="crm-chrome">
        <div className="crm-chrome-top">
          <div>
            <h1>Notifications</h1>
            <p>Recent closed deals from the sales database.</p>
          </div>
        </div>
      </div>
      <div className="deal-table-wrap bleed">
        <table className="deal-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Owner</th>
              <th>Account</th>
              <th className="num">Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.employee}</td>
                <td>{item.customer}</td>
                <td className="num">{money(item.amount, 0)}</td>
                <td className="muted">{item.closedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Close/HubSpot record page: properties + deals left, activity right */
function CustomerView({
  customer,
  deals,
  onOwner,
}: {
  customer: Customer | undefined;
  deals: Deal[];
  onOwner: (id: number) => void;
}) {
  const accountDeals = useMemo(
    () => (customer ? deals.filter((d) => d.customerId === customer.id) : []),
    [customer, deals],
  );
  const { status, setStatus, counts, filtered } = useDealFilter(accountDeals);
  const [mode, setMode] = useState<SurfaceMode>("list");
  if (!customer)
    return (
      <EmptyState
        title="Account not found"
        body="This account is not in the current sales database."
      />
    );
  const won = accountDeals.filter((d) => d.status === "won");
  const avg = won.length
    ? won.reduce((n, d) => n + d.amount, 0) / won.length
    : 0;
  const total = customer.deals + customer.lost;
  const winRate = total ? (customer.deals / total) * 100 : 0;
  const topOwner = [...won].sort((a, b) => b.amount - a.amount)[0];
  const byPlatform = useMemo(() => {
    const map = new Map<string, { revenue: number; deals: number }>();
    for (const d of won) {
      const cur = map.get(d.platform) ?? { revenue: 0, deals: 0 };
      cur.revenue += d.amount;
      cur.deals += 1;
      map.set(d.platform, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].revenue - a[1].revenue);
  }, [won]);

  return (
    <section className="crm-screen">
      <RecordChrome
        title={customer.name}
        subtitle="Account record · deals, properties, and activity"
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
      />
      <MetricsBar
        items={[
          { label: "Revenue", value: money(customer.revenue, 2) },
          { label: "Closed won", value: String(customer.deals) },
          { label: "Closed lost", value: String(customer.lost) },
          { label: "Win rate", value: `${winRate.toFixed(0)}%` },
          { label: "Avg won deal", value: money(avg, 0) },
          { label: "Deal owner", value: topOwner?.employee ?? "—" },
        ]}
      />
      {mode === "board" ? (
        <PipelineBoard deals={filtered} />
      ) : (
        <div className="crm-split record-split">
          <div className="record-main">
            <div className="property-grid">
              <div>
                <label>Primary owner</label>
                <strong>{topOwner?.employee ?? "—"}</strong>
              </div>
              <div>
                <label>Top platform</label>
                <strong>{byPlatform[0]?.[0] ?? "—"}</strong>
              </div>
              <div>
                <label>Last close</label>
                <strong>{accountDeals[0]?.closedAt ?? "—"}</strong>
              </div>
              <div>
                <label>Open rows</label>
                <strong>{accountDeals.length}</strong>
              </div>
            </div>
            <h2 className="section-label">Deals</h2>
            <DealTable
              deals={filtered}
              showCustomer={false}
              onOwner={onOwner}
            />
            <h2 className="section-label">Revenue by month</h2>
            <MiniTrend deals={accountDeals} />
            <h2 className="section-label">Platform mix</h2>
            <div className="deal-table-wrap bleed compact">
              <table className="deal-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th className="num">Won deals</th>
                    <th className="num">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {byPlatform.map(([name, stats]) => (
                    <tr key={name}>
                      <td>
                        <span className="platform-cell">
                          <PlatformIcon name={name} />
                          {name}
                        </span>
                      </td>
                      <td className="num">{stats.deals}</td>
                      <td className="num">{money(stats.revenue, 0)}</td>
                    </tr>
                  ))}
                  {!byPlatform.length && (
                    <tr>
                      <td colSpan={3} className="muted">
                        No won deals for this account in the period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <ActivityRail deals={accountDeals} title="Activity" />
        </div>
      )}
    </section>
  );
}

function DealStatsView({
  title,
  data,
  deals,
  onCustomer,
  onOwner,
}: {
  title: string;
  data: DashboardData;
  deals: Deal[];
  onCustomer: (name: string) => void;
  onOwner: (id: number) => void;
}) {
  const { status, setStatus, counts, filtered } = useDealFilter(deals);
  const [mode, setMode] = useState<SurfaceMode>("list");
  return (
    <section className="crm-screen">
      <RecordChrome
        title={title}
        subtitle="Deal volume, value, and close history for the selected period."
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
      />
      <MetricsBar
        items={[
          {
            label: "Average deal value",
            value: money(data.summary.averageValue, 2),
          },
          { label: "Closed won", value: String(data.summary.deals) },
          {
            label: "Win rate",
            value: `${data.summary.winRate.toFixed(0)}%`,
          },
          {
            label: "Best deal",
            value: `${money(data.summary.bestDeal, 0)} · ${data.summary.bestCustomer}`,
          },
        ]}
      />
      {mode === "board" ? (
        <PipelineBoard deals={filtered} onCustomer={onCustomer} />
      ) : (
        <div className="crm-split">
          <div className="record-main">
            <DealTable
              deals={filtered}
              onCustomer={onCustomer}
              onOwner={onOwner}
            />
            <h2 className="section-label">Revenue trend</h2>
            <MiniTrend deals={deals} />
          </div>
          <ActivityRail deals={filtered} />
        </div>
      )}
    </section>
  );
}

function PlatformRevenueView({
  data,
  deals,
  onCustomer,
  onOwner,
}: {
  data: DashboardData;
  deals: Deal[];
  onCustomer: (name: string) => void;
  onOwner: (id: number) => void;
}) {
  const [platform, setPlatform] = useState(data.platforms[0]?.name ?? "");
  const rows = deals.filter((d) =>
    platform ? d.platform === platform : true,
  );
  const { status, setStatus, counts, filtered } = useDealFilter(rows);
  const [mode, setMode] = useState<SurfaceMode>("list");
  return (
    <section className="crm-screen">
      <RecordChrome
        title="Platform revenue"
        subtitle="Deals by acquisition channel."
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
        extra={
          <div className="owner-filter">
            {data.platforms.map((p) => (
              <button
                key={p.id}
                className={platform === p.name ? "active" : ""}
                onClick={() => setPlatform(p.name)}
              >
                <PlatformIcon name={p.name} />
                {p.name}
              </button>
            ))}
          </div>
        }
      />
      <MetricsBar
        items={data.platforms.map((p) => ({
          label: p.name,
          value: money(p.revenue, 0),
          hint: `${p.deals} deals · ${p.share.toFixed(1)}%`,
        }))}
      />
      {mode === "board" ? (
        <PipelineBoard deals={filtered} onCustomer={onCustomer} />
      ) : (
        <div className="crm-split">
          <DealTable
            deals={filtered}
            onCustomer={onCustomer}
            onOwner={onOwner}
          />
          <ActivityRail deals={filtered} />
        </div>
      )}
    </section>
  );
}

function ReportsIndexView({
  reports,
  deals,
  onSelect,
  onCustomer,
}: {
  reports: string[];
  deals: Deal[];
  onSelect: (name: string) => void;
  onCustomer: (name: string) => void;
}) {
  return (
    <section className="crm-screen">
      <div className="crm-chrome">
        <div className="crm-chrome-top">
          <div>
            <h1>Reports</h1>
            <p>Open a saved report, or browse the deals feeding every view.</p>
          </div>
        </div>
      </div>
      <div className="report-launch">
        {reports.map((report) => (
          <button key={report} onClick={() => onSelect(report)}>
            <strong>{report}</strong>
            <span>Open report</span>
          </button>
        ))}
      </div>
      <h2 className="section-label">Latest deals across reports</h2>
      <div className="crm-split">
        <DealTable deals={deals.slice(0, 30)} onCustomer={onCustomer} />
        <ActivityRail deals={deals} />
      </div>
    </section>
  );
}

function FolderView({
  title,
  reports,
  deals,
  onSelect,
  onCreate,
}: {
  title: string;
  reports: string[];
  deals: Deal[];
  onSelect: (name: string) => void;
  onCreate?: () => void;
}) {
  return (
    <section className="crm-screen">
      <div className="crm-chrome">
        <div className="crm-chrome-top">
          <div>
            <h1>{title}</h1>
            <p>
              {title === "Manage folders"
                ? "Organize report views in your iQuee workspace."
                : `${title} built from your current report views and live deals.`}
            </p>
          </div>
        </div>
      </div>
      <div className="report-launch">
        {reports.map((report) => (
          <button key={report} onClick={() => onSelect(report)}>
            <strong>{report}</strong>
            <span>
              {money(
                deals
                  .filter((d) => d.status === "won")
                  .reduce((n, d) => n + d.amount, 0),
                0,
              )}{" "}
              period revenue
            </span>
          </button>
        ))}
      </div>
      {onCreate && (
        <button className="dark-button panel-action" onClick={onCreate}>
          Add folder
        </button>
      )}
      <h2 className="section-label">Recent deals</h2>
      <DealTable deals={deals.slice(0, 25)} />
    </section>
  );
}

/** Close inbox + HubSpot metrics home */
function HomeView({
  data,
  onOpen,
  onCustomer,
  onOwner,
}: {
  data: DashboardData;
  onOpen: (name: string) => void;
  onCustomer: (name: string) => void;
  onOwner: (id: number) => void;
}) {
  const { status, setStatus, counts, filtered } = useDealFilter(data.deals);
  const [mode, setMode] = useState<SurfaceMode>("list");
  return (
    <section className="crm-screen">
      <RecordChrome
        title="Home"
        subtitle="Pipeline snapshot and the latest deal activity."
        mode={mode}
        onMode={setMode}
        status={status}
        onStatus={setStatus}
        counts={counts}
        extra={
          <div className="owner-filter">
            {["Sales analytics", "Team", "Sales list", "Goals"].map((item) => (
              <button key={item} onClick={() => onOpen(item)}>
                {item}
              </button>
            ))}
          </div>
        }
      />
      <MetricsBar
        items={[
          { label: "Revenue", value: money(data.summary.revenue, 0) },
          { label: "Closed won", value: String(data.summary.deals) },
          {
            label: "Win rate",
            value: `${data.summary.winRate.toFixed(0)}%`,
          },
          { label: "Top account", value: data.summary.bestCustomer },
          {
            label: "Avg deal",
            value: money(data.summary.averageValue, 0),
          },
          { label: "Top sales", value: data.topSales?.name ?? "—" },
        ]}
      />
      {mode === "board" ? (
        <PipelineBoard deals={filtered} onCustomer={onCustomer} />
      ) : (
        <div className="crm-split">
          <div className="record-main">
            <h2 className="section-label">Latest deals</h2>
            <DealTable
              deals={filtered.slice(0, 40)}
              onCustomer={onCustomer}
              onOwner={onOwner}
            />
          </div>
          <div className="home-rail">
            <ActivityRail deals={filtered} title="Activity" />
            <div className="side-account-list">
              <h2 className="section-label">Accounts</h2>
              {data.customers.slice(0, 10).map((c) => (
                <button key={c.id} onClick={() => onCustomer(c.name)}>
                  <span>{c.name}</span>
                  <strong>{money(c.revenue, 0)}</strong>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function RecentDealsPanel({
  deals,
  onCustomer,
}: {
  deals: Deal[];
  onCustomer: (name: string) => void;
}) {
  return (
    <section className="recent-deals-panel">
      <div className="recent-deals-heading">
        <h2>Recent deals</h2>
        <p>Live rows from the sales database for this timeframe.</p>
      </div>
      <DealTable deals={deals.slice(0, 14)} onCustomer={onCustomer} compact />
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
  const goOwner = (id: number) => onSelectEmployee(id);

  if (view === "Home")
    return (
      <HomeView
        data={data}
        onOpen={onNavigate}
        onCustomer={onNavigate}
        onOwner={goOwner}
      />
    );
  if (view === "Team")
    return (
      <TeamView
        team={data.team}
        deals={data.deals}
        onOwner={goOwner}
        onCustomer={onNavigate}
      />
    );
  if (view === "Workspace")
    return (
      <WorkspaceView
        customers={data.customers}
        platforms={data.platforms}
        deals={data.deals}
        onCustomer={onNavigate}
      />
    );
  if (view === "Notifications")
    return <NotificationsView items={data.notifications} />;
  if (view === "Sales list" || view === "Deals by user")
    return (
      <SalesListView
        deals={data.deals}
        team={data.team}
        onOwner={goOwner}
        onCustomer={onNavigate}
      />
    );
  if (view === "Goals")
    return (
      <GoalsView team={data.team} deals={data.deals} onOwner={goOwner} />
    );
  if (view === "Deal duration" || view === "Deal duration report")
    return (
      <DealStatsView
        title={view}
        data={data}
        deals={data.deals}
        onCustomer={onNavigate}
        onOwner={goOwner}
      />
    );
  if (view === "Platform revenue")
    return (
      <PlatformRevenueView
        data={data}
        deals={data.deals}
        onCustomer={onNavigate}
        onOwner={goOwner}
      />
    );
  if (view === "Reports")
    return (
      <ReportsIndexView
        reports={reportList}
        deals={data.deals}
        onSelect={onNavigate}
        onCustomer={onNavigate}
      />
    );
  if (
    view === "Recent reports" ||
    view === "Starred reports" ||
    view === "Manage folders"
  )
    return (
      <FolderView
        title={view}
        reports={["New report", "Analytics", "Team"]}
        deals={data.deals}
        onSelect={onNavigate}
        onCreate={view === "Manage folders" ? onCreate : undefined}
      />
    );
  if (customer)
    return (
      <CustomerView
        customer={customer}
        deals={data.deals}
        onOwner={goOwner}
      />
    );

  return (
    <EmptyState
      title={view}
      body="No matching records for this section in the current sales database."
    />
  );
}
