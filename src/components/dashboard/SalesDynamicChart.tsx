import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ArrowUpRight } from "lucide-react";
import type { DynamicPoint } from "../../types/dashboard";
import { money } from "../ui";
export function SalesDynamicChart({ data }: { data: DynamicPoint[] }) {
  return (
    <div className="dynamic-section">
      <h3>
        Sales dynamic
        <ArrowUpRight size={15} />
      </h3>
      <div className="dynamic-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 6, right: 8, bottom: 0, left: 4 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#e8dedd"
              strokeDasharray="3 4"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              minTickGap={28}
              tick={{ fontSize: 8, fill: "#a6a0a0" }}
              tickFormatter={(value) => String(value).slice(5)}
            />
            <Tooltip formatter={(v) => money(Number(v))} />
            <Line
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#cd3563"
              strokeWidth={1.6}
              dot={false}
            />
            <Line
              name="Previous"
              type="monotone"
              dataKey="previous"
              stroke="#b3b88b"
              strokeWidth={1.2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
