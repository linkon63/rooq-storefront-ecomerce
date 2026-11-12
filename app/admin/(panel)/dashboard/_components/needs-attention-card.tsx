import Link from "next/link";
import type { DashboardSummary } from "@/types/admin/dashboard";
import { AttentionTile } from "./attention-tile";
import { LowStockRow } from "./low-stock-row";

/** Fashion ops: returns to review, sizes customers are waiting on, sizes running out. */
export function NeedsAttentionCard({ summary, isLoading }: { summary: DashboardSummary | null; isLoading: boolean }) {
  const alerts = summary?.lowStockAlerts ?? [];
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h2 className="mb-2 text-2xl font-black">Needs attention</h2>
        <AttentionTile
          hint="Return and exchange requests waiting for a decision"
          href="/admin/returns?status=REQUESTED"
          icon="return"
          isLoading={isLoading}
          label="Open returns"
          value={summary?.openReturnRequests.value}
        />
        <AttentionTile
          hint="Shoppers asking to be emailed when a size is back"
          href="/admin/back-in-stock"
          icon="zap"
          isLoading={isLoading}
          label="Back-in-stock requests"
          value={summary?.backInStockRequests.value}
        />
        <AttentionTile
          hint="Sizes at or under their low-stock threshold"
          href="/admin/reports/inventory"
          icon="stock"
          isLoading={isLoading}
          label="Low-stock variants"
          value={summary?.lowStockProducts.value}
        />
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black">Running low</h2>
          <Link className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-black hover:bg-slate-50" href="/admin/stock">
            Restock
          </Link>
        </div>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => <div className="h-12 animate-pulse rounded-lg bg-slate-100" key={index} />)}
          </div>
        ) : alerts.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 font-medium text-slate-400">Every size is above its low-stock threshold.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <LowStockRow alert={alert} key={alert.variantId} />
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
