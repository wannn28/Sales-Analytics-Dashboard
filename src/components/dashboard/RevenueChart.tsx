import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { RevenuePoint, Platform } from "../../types/dashboard";
import { PlatformIcon, money } from "../ui";
import { loadPlatformRevenue } from "../../services/api";
export function RevenueChart({
  platform,
  period,
  employee,
}: {
  platform?: Platform;
  period: string;
  employee: number | null;
}) {
  const [metric, setMetric] = useState<"revenue" | "leads" | "kpi">("revenue");
  const [data, setData] = useState<RevenuePoint[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setData([]);
    setError(false);
    loadPlatformRevenue(period, employee, platform?.id ?? 1, controller.signal)
      .then(setData)
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [period, employee, platform?.id]);
  return (
    <section className="soft-card revenue-card">
      <div className="platform-heading">
        <div>
          <PlatformIcon name={platform?.name ?? "Dribbble"} />
          <span>
            Platform value<strong>{platform?.name ?? "Dribbble"}⌄</strong>
          </span>
        </div>
        <div className="segmented">
          {(["revenue", "leads", "kpi"] as const).map((m) => (
            <button
              key={m}
              className={metric === m ? "active" : ""}
              onClick={() => setMetric(m)}
            >
              {m === "kpi" ? "KPI" : m[0].toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="revenue-chart-body">
        <div className="pink-stat">
          <span className="vertical-label">Average monthly</span>
          <div>
            <label>Revenue</label>
            <strong>
              {money(
                (platform?.revenue ?? 0) /
                  (period === "month" ? 1 : period === "all" ? 6 : 3),
              )}
            </strong>
            <label>Deals</label>
            <strong>
              {platform?.deals ?? 0}
              <small> won</small>
            </strong>
            <label>Revenue share</label>
            <strong>
              {platform?.share.toFixed(0) ?? 0}%<small> of total</small>
            </strong>
          </div>
        </div>
        <div className="bar-chart">
          {error ? (
            <p role="alert">Chart unavailable. Refresh to retry.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 31, right: 3, bottom: 0, left: 0 }}
                barCategoryGap="20%"
              >
                <defs>
                  <pattern
                    id="bar-hatch"
                    width="4"
                    height="4"
                    patternUnits="userSpaceOnUse"
                    patternTransform="rotate(25)"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="4"
                      stroke="#babbbb"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e7e7e7"
                  strokeDasharray="2 5"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#a1a2a1", fontSize: 9 }}
                />
                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  width={35}
                  tick={{ fill: "#b2b3b2", fontSize: 8 }}
                  tickFormatter={(v) =>
                    metric === "revenue" ? `$${v / 1000}k` : String(v)
                  }
                />
                <Tooltip
                  cursor={{ fill: "#e6e6e650" }}
                  formatter={(value) =>
                    metric === "revenue" ? money(Number(value)) : Number(value)
                  }
                />
                <Bar
                  dataKey={metric}
                  fill="url(#bar-hatch)"
                  radius={[3, 3, 0, 0]}
                >
                  <LabelList
                    dataKey={metric}
                    position="top"
                    fill="#bd2857"
                    fontSize={9}
                    formatter={(v) =>
                      metric === "revenue" ? money(Number(v)) : String(v)
                    }
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
