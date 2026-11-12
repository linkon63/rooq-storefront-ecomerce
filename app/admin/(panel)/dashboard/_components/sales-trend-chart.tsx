"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { compactAmount } from "@/utils/dashboard/format";

export type TrendBar = { label: string; total: number; orders: number };

const AXIS_TICK = { fill: "#94a3b8", fontWeight: 700 };

/** recharts bar chart — loaded with next/dynamic so it stays out of the first bundle. */
export default function SalesTrendChart({ data }: { data: TrendBar[] }) {
  const { symbol } = useCurrency();
  return (
    <ResponsiveContainer height="100%" width="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#f1f5f9" vertical={false} />
        <XAxis axisLine={false} dataKey="label" fontSize={12} tick={AXIS_TICK} tickLine={false} />
        <YAxis axisLine={false} fontSize={12} tick={AXIS_TICK} tickFormatter={(value) => compactAmount(Number(value))} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontWeight: 700 }}
          cursor={{ fill: "#f8fafc" }}
          formatter={(value) => [formatMoney(Number(value), symbol), "Revenue"]}
          labelStyle={{ fontWeight: 800, color: "#0f172a" }}
        />
        <Bar dataKey="total" fill="url(#salesBar)" maxBarSize={48} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
