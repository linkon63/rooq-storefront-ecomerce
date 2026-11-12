"use client";

import Link from "next/link";
import { AdminIcon, type AdminIconName } from "../../../_components/admin-shell";
import type { MetricValue } from "@/types/admin/dashboard";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";
import { formatCount } from "@/utils/dashboard/format";
import { TrendBadge } from "./trend-badge";

export type MetricCardProps = {
  label: string;
  metric?: MetricValue;
  icon: AdminIconName;
  tone: string;
  href: string;
  isMoney?: boolean;
  goodWhenDown?: boolean;
  caption?: string;
  isLoading: boolean;
};

export function MetricCard({
  label,
  metric,
  icon,
  tone,
  href,
  isMoney = false,
  goodWhenDown = false,
  caption = "Compared to previous period",
  isLoading,
}: MetricCardProps) {
  const { symbol } = useCurrency();
  const value = metric?.value ?? 0;
  return (
    <Link className="group relative block p-4 transition hover:bg-slate-50/80 focus-visible:outline-2 focus-visible:outline-blue-600 sm:p-6" href={href}>
      <div className="mb-7 flex items-center gap-3">
        <span className={`grid h-7 w-7 place-items-center rounded-md ${tone}`}>
          <AdminIcon className="h-4 w-4" name={icon} />
        </span>
        <h2 className="font-black text-slate-600">{label}</h2>
        <AdminIcon
          className="ml-auto h-4 w-4 text-slate-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-slate-500 group-hover:opacity-100"
          name="chevronRight"
        />
      </div>
      {isLoading ? (
        <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-3xl font-black tabular-nums">{isMoney ? formatMoney(value, symbol) : formatCount(value)}</p>
      )}
      <div className="mt-4 flex items-center gap-3 text-sm font-black">
        <span className="text-slate-500">{caption}</span>
        {isLoading ? (
          <span className="h-6 w-14 animate-pulse rounded-md bg-slate-100" />
        ) : (
          <TrendBadge goodWhenDown={goodWhenDown} trend={metric?.trend ?? null} />
        )}
      </div>
    </Link>
  );
}
