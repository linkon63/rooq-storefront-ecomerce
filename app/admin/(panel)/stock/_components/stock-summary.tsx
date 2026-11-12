import type { LowStockReport } from "@/types/catalog-admin";

export function StockSummary({ report, onFilter }: { report: LowStockReport; onFilter: (filter: "low" | "out") => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <button type="button" onClick={() => onFilter("low")} className="rounded-xl bg-amber-50 p-4 text-left ring-1 ring-amber-200 hover:ring-amber-400">
        <p className="text-3xl font-semibold tabular-nums text-amber-900">{report.lowStock}</p>
        <p className="text-sm text-amber-800">sizes running low (at or under their threshold)</p>
      </button>
      <button type="button" onClick={() => onFilter("out")} className="rounded-xl bg-red-50 p-4 text-left ring-1 ring-red-200 hover:ring-red-400">
        <p className="text-3xl font-semibold tabular-nums text-red-900">{report.outOfStock}</p>
        <p className="text-sm text-red-800">sizes sold out</p>
      </button>
    </div>
  );
}
