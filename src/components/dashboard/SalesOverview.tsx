import { useState } from "react";
import {
  AlignLeft,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronUp,
  ListFilter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { PlatformIcon, money } from "../ui";
import type { Platform } from "../../types/dashboard";
export function SalesOverview({
  platforms,
  selected,
  onSelect,
}: {
  platforms: Platform[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [sort, setSort] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(true);
  const [referrerOpen, setReferrerOpen] = useState(true);
  const shown = [...platforms]
    .filter((p) => p.name !== "Other")
    .sort((a, b) => (sort ? a.revenue - b.revenue : b.revenue - a.revenue));
  return (
    <div className="overview-grid">
      <section className="soft-card source-card">
        <div className="card-toolbar">
          <span>
            <AlignLeft size={17} />
            <button
              className="collapse-button"
              aria-label={
                sourceOpen ? "Hide platform list" : "Show platform list"
              }
              onClick={() => setSourceOpen(!sourceOpen)}
            >
              {sourceOpen ? <ChevronDown size={11} /> : <ChevronUp size={11} />}
            </button>
          </span>
          <button onClick={() => setSort(!sort)} aria-label="Sort platforms">
            Filters
            <ListFilter size={12} />
          </button>
        </div>
        {sourceOpen && (
          <div className="platform-list">
            {shown.map((p) => (
              <button
                className={selected === p.name ? "selected" : ""}
                key={p.id}
                onClick={() => onSelect(p.name)}
              >
                <PlatformIcon name={p.name} />
                <span>{p.name}</span>
                <strong>{money(p.revenue)}</strong>
                <em>{p.share.toFixed(0)}%</em>
              </button>
            ))}
          </div>
        )}
      </section>
      <section className="soft-card referrer-card">
        <div className="card-toolbar">
          <span>
            <ChartNoAxesColumn size={17} />
            <button
              className="collapse-button"
              aria-label={
                referrerOpen ? "Hide referrer chart" : "Show referrer chart"
              }
              onClick={() => setReferrerOpen(!referrerOpen)}
            >
              {referrerOpen ? (
                <ChevronDown size={11} />
              ) : (
                <ChevronUp size={11} />
              )}
            </button>
          </span>
          <button onClick={() => setSort(!sort)}>
            Filters
            <ListFilter size={12} />
          </button>
        </div>
        {referrerOpen && (
          <div className="referrer-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={shown}
                margin={{ top: 12, left: 0, right: 0, bottom: 0 }}
                barCategoryGap="14%"
              >
                <defs>
                  <pattern
                    id="referrer-hatch"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(30)"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="4"
                      stroke="#d9d9d9"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <XAxis dataKey="name" hide />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value) => money(Number(value))}
                />
                <Bar dataKey="revenue" radius={[12, 12, 8, 8]}>
                  {shown.map((p) => (
                    <Cell
                      key={p.id}
                      fill={
                        selected === p.name
                          ? "#cf2b5f"
                          : p.name === "Dribbble"
                            ? "#f3d5e0"
                            : p.name === "Instagram"
                              ? "#f7c9d8"
                              : p.name === "Behance"
                                ? "#d7e0f5"
                                : p.name === "Google"
                                  ? "#e8edd8"
                                  : "#e5e2e0"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="referrer-icons">
              {shown.map((p) => (
                <PlatformIcon key={p.id} name={p.name} />
              ))}
            </div>
          </div>
        )}
        <p>
          Deals amount
          <br />
          <strong>by referrer category</strong>
          {referrerOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </p>
      </section>
    </div>
  );
}
