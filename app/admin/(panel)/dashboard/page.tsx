"use client";

import { PageHeader } from "../../_components/admin-shell";
import { ReportError } from "../reports/_components/report-error";
import { DashboardFilters } from "./_components/dashboard-filters";
import { KpiGrid } from "./_components/kpi-grid";
import { NeedsAttentionCard } from "./_components/needs-attention-card";
import { RecentOrdersCard } from "./_components/recent-orders-card";
import { SalesTrendCard } from "./_components/sales-trend-card";
import { TopProductsCard } from "./_components/top-products-card";
import { useDashboard } from "./_hooks/use-dashboard";

export default function DashboardPage() {
  const { summary, trend, topProducts, isLoading, isTrendLoading, error } = useDashboard();

  return (
    <>
      <PageHeader action={<DashboardFilters />} description="Sales, stock and returns at a glance." title="Dashboard" />
      <ReportError message={error} />
      <KpiGrid isLoading={isLoading} summary={summary} />
      <NeedsAttentionCard isLoading={isLoading} summary={summary} />
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <SalesTrendCard isLoading={isTrendLoading} trend={trend} />
        <RecentOrdersCard isLoading={isLoading} orders={summary?.recentOrders ?? []} />
      </section>
      <TopProductsCard isLoading={isLoading} products={topProducts} />
    </>
  );
}
