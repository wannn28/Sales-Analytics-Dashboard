import {
  ArrowUpRight,
  Star,
  Plus,
  SlidersHorizontal,
  Download,
  Share2,
} from "lucide-react";
import { Avatar, Brand, Down, money } from "../ui";
import type { DashboardData, Employee } from "../../types/dashboard";
export function RevenueHeader({
  data,
  members,
  period,
  setPeriod,
  employee,
  setEmployee,
  onDetails,
  onExport,
  onShare,
  title,
}: {
  data: DashboardData;
  members: Employee[];
  period: string;
  setPeriod: (value: string) => void;
  employee: number | null;
  setEmployee: (value: number | null) => void;
  onDetails: () => void;
  onExport: () => void;
  onShare: () => void;
  title: string;
}) {
  const { summary: s, team, topSales } = data;
  const [whole, cents] = money(s.revenue, 2).split(".");
  return (
    <>
      <div className="report-toolbar">
        <div className="member-chips">
          <button
            className="circle-add"
            onClick={() => setEmployee(null)}
            aria-label="Show all members"
          >
            <Plus size={18} />
          </button>
          {members.slice(0, 3).map((person) => (
            <button
              key={person.id}
              className={`member-chip ${employee === person.id ? "chosen" : ""}`}
              onClick={() =>
                setEmployee(employee === person.id ? null : person.id)
              }
            >
              <Avatar person={person} small />
              {person.name}
            </button>
          ))}
          <button
            className="company-chip"
            aria-label="All workspace members"
            onClick={() => setEmployee(null)}
          >
            <Brand small />
          </button>
        </div>
        <div className="toolbar-actions">
          <button
            className="round-button"
            aria-label="Filter by top salesperson"
            onClick={() =>
              setEmployee(employee ? null : (topSales?.id ?? null))
            }
          >
            <SlidersHorizontal size={16} />
          </button>
          <button
            className="round-button"
            aria-label="Export report"
            onClick={onExport}
          >
            <Download size={16} />
          </button>
          <button
            className="round-button"
            aria-label="Share report"
            onClick={onShare}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
      <div className="title-row">
        <h1>{title}</h1>
        <div className="timeframe">
          <button
            className={`switch ${period !== "all" ? "on" : ""}`}
            aria-label="Toggle timeframe"
            role="switch"
            aria-checked={period !== "all"}
            onClick={() => setPeriod(period === "all" ? "quarter" : "all")}
          />
          <span>Timeframe</span>
          <select
            aria-label="Report timeframe"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="quarter">Sep 1 – Nov 30, 2023</option>
            <option value="month">Nov 1 – Nov 30, 2023</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
      <div className="revenue-summary">
        <section className="revenue-total">
          <h2>Revenue</h2>
          <div className="revenue-number">
            {whole}
            <span>.{cents}</span>
            <b>
              <ArrowUpRight size={12} />
              {s.growth.toFixed(1)}%
            </b>
            <b>{money(s.revenue - s.previousRevenue)}</b>
          </div>
          <p>
            vs prev. <strong>{money(s.previousRevenue, 2)}</strong>
            <span>
              {" "}
              {new Date(s.previousStart + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric" },
              )}{" "}
              –{" "}
              {new Date(s.previousEnd + "T00:00:00").toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              )}{" "}
              <Down />
            </span>
          </p>
        </section>
        <div className="stat-cards">
          <div className="stat-card top-sales">
            <label>Top sales</label>
            <strong>{topSales?.deals ?? 0}</strong>
            <span>
              {topSales && <Avatar person={topSales} small />}
              {topSales?.name.split(" ")[0] ?? "—"}
              <span className="stat-arrow">›</span>
            </span>
          </div>
          <div className="stat-card best-deal">
            <label>
              Best deal
              <Star size={13} />
            </label>
            <strong>{money(s.bestDeal)}</strong>
            <span>
              {s.bestCustomer}
              <ArrowUpRight size={14} />
            </span>
          </div>
          <div className="stat-card narrow">
            <label>Deals</label>
            <strong className="gray-pill">{s.deals}</strong>
            <span>+ 5</span>
          </div>
          <div className="stat-card narrow value">
            <label>Value</label>
            <strong className="pink-pill">
              ${Math.round(s.averageValue / 1000)}k
            </strong>
            <span>↑ {s.growth.toFixed(0)}%</span>
          </div>
          <div className="stat-card narrow">
            <label>Win rate</label>
            <strong className="gray-pill">{s.winRate.toFixed(0)}%</strong>
            <span>↑ 12%</span>
          </div>
        </div>
      </div>
      <div className="distribution">
        {team.map((person) => (
          <div
            key={person.id}
            className="distribution-segment"
            style={{ flexGrow: Math.max(person.revenue, 1) }}
          >
            <Avatar person={person} small />
            <strong>{money(person.revenue)}</strong>
            <span>
              {((person.revenue / (s.revenue || 1)) * 100).toFixed(2)}%
            </span>
          </div>
        ))}
        <button className="dark-button" onClick={onDetails}>
          Details
        </button>
      </div>
    </>
  );
}
