"use client";

import { AdminIcon, type AdminIconName } from "../../../_components/admin-shell";
import { formatMoney } from "@/utils/admin/format";
import { useCurrency } from "@/hooks/use-currency";

/** One KPI tile on a report page. */
export function StatCard({
  label,
  value,
  icon,
  isMoney = false,
  isLoading,
}: {
  label: string;
  value: number | null | undefined;
  icon: AdminIconName;
  isMoney?: boolean;
  isLoading: boolean;
}) {
  const { symbol } = useCurrency();
  const display =
    value === null || value === undefined ? "-" : isMoney ? formatMoney(value, symbol) : value.toLocaleString("en");
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-blue-50 text-blue-600">
          <AdminIcon className="h-4 w-4" name={icon} />
        </span>
        <p className="font-black text-slate-500">{label}</p>
      </div>
      {isLoading ? (
        <div className="h-9 w-28 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="text-3xl font-black tabular-nums">{display}</p>
      )}
    </article>
  );
}
