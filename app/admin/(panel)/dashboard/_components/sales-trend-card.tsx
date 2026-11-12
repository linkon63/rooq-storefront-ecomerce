"use client";

import dynamic from "next/dynamic";
import type { SalesTrendPoint } from "@/types/admin/dashboard";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectGranularity, setGranularity } from "@/lib/store/slices/admin-filters-slice";
import type { ChartGranularity } from "@/types/dashboard";
import { formatBucket } from "@/utils/dashboard/format";

const SalesTrendChart = dynamic(() => import("./sales-trend-chart"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />,
});

const GRANULARITIES: readonly ChartGranularity[] = ["daily", "monthly", "yearly"];

export function SalesTrendCard({ trend, isLoading }: { trend: SalesTrendPoint[]; isLoading: boolean }) {
  const granularity = useAppSelector(selectGranularity);
  const dispatch = useAppDispatch();
  const data = trend.map((point) => ({ ...point, label: formatBucket(point.date, granularity) }));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-black">Sales trend</h2>
        <div aria-label="Group sales by" className="flex gap-2" role="group">
          {GRANULARITIES.map((value) => (
            <button
              aria-pressed={granularity === value}
              className={`rounded-lg px-4 py-2 font-black capitalize transition ${
                granularity === value ? "bg-blue-50 text-blue-600" : "text-slate-400 hover:text-slate-600"
              }`}
              key={value}
              onClick={() => dispatch(setGranularity(value))}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-xl bg-slate-100" />
        ) : data.length === 0 ? (
          <p className="flex h-full items-center justify-center font-black text-slate-400">No paid sales in this period.</p>
        ) : (
          <SalesTrendChart data={data} />
        )}
      </div>
    </article>
  );
}
