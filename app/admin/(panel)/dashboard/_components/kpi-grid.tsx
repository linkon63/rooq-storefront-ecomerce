import type { DashboardSummary } from "@/types/admin/dashboard";
import { MetricCard } from "./metric-card";

const ROW = "grid divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4";

/** The eight headline KPIs, in two rows. */
export function KpiGrid({ summary, isLoading }: { summary: DashboardSummary | null; isLoading: boolean }) {
  const s = summary ?? undefined;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-slate-900/5">
      <div className={ROW}>
        <MetricCard href="/admin/orders" icon="report" isLoading={isLoading} isMoney label="Total sales" metric={s?.totalSales} tone="bg-blue-50 text-blue-600" />
        <MetricCard href="/admin/orders" icon="orders" isLoading={isLoading} label="Total orders" metric={s?.totalOrders} tone="bg-emerald-50 text-emerald-600" />
        <MetricCard goodWhenDown href="/admin/orders?status=pending" icon="refresh" isLoading={isLoading} label="Pending orders" metric={s?.pendingOrders} tone="bg-amber-50 text-amber-600" />
        <MetricCard caption="Per paid order" href="/admin/reports/sales" icon="discount" isLoading={isLoading} isMoney label="Avg. order value" metric={s?.avgOrderValue} tone="bg-sky-50 text-sky-600" />
      </div>
      <div className={`${ROW} border-t border-slate-200`}>
        <MetricCard
          caption="New customers vs previous"
          href="/admin/reports/customer"
          icon="user"
          isLoading={isLoading}
          label="Customers"
          metric={s ? { value: s.totalCustomers.value, trend: s.newCustomers.trend } : undefined}
          tone="bg-violet-50 text-violet-600"
        />
        <MetricCard caption="Live catalogue" href="/admin/products" icon="package" isLoading={isLoading} label="Products" metric={s?.totalProducts} tone="bg-slate-100 text-slate-600" />
        <MetricCard goodWhenDown href="/admin/orders/returned?paymentStatus=refunded" icon="return" isLoading={isLoading} isMoney label="Refunded" metric={s?.refundAmount} tone="bg-rose-50 text-rose-600" />
        <MetricCard caption="Sizes at or under threshold" goodWhenDown href="/admin/reports/inventory" icon="stock" isLoading={isLoading} label="Low-stock variants" metric={s?.lowStockProducts} tone="bg-rose-50 text-rose-600" />
      </div>
    </section>
  );
}
