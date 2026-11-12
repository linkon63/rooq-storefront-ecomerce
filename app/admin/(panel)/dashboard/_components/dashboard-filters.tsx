"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  selectDashboardPeriod,
  selectDashboardRange,
  setDashboardPeriod,
  setDashboardRange,
} from "@/lib/store/slices/admin-filters-slice";
import { DateRangeField } from "../../reports/_components/date-range-field";

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "7 days" },
  { key: "month", label: "30 days" },
] as const;

/** Quick period buttons plus a custom date range. */
export function DashboardFilters() {
  const period = useAppSelector(selectDashboardPeriod);
  const range = useAppSelector(selectDashboardRange);
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div aria-label="Reporting period" className="flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm font-black shadow-sm" role="group">
        {PERIODS.map(({ key, label }) => (
          <button
            aria-pressed={period === key}
            className={`px-4 py-3 transition ${period === key ? "bg-blue-600 text-white" : "hover:bg-slate-50"}`}
            key={key}
            onClick={() => dispatch(setDashboardPeriod(key))}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <DateRangeField isActive={period === "custom"} onChange={(next) => dispatch(setDashboardRange(next))} value={range} />
    </div>
  );
}
