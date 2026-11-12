"use client";

import { PageHeader } from "../../../_components/page-header";
import type { SalesReport } from "@/types/admin/reports";
import { ReportActions } from "../_components/report-actions";
import { ReportError } from "../_components/report-error";
import { ReportPanel } from "../_components/report-panel";
import { StatCard } from "../_components/stat-card";
import { Pager } from "../_components/pager";
import { useReport } from "../_hooks/use-report";
import { SalesOrdersTable } from "./_components/sales-orders-table";
import { ProductBreakdownTable } from "./_components/product-breakdown-table";

export default function SalesReportPage() {
  const { data, isLoading, error, setPage } = useReport<SalesReport>("sales");
  const summary = data?.summary;

  return (
    <>
      <PageHeader action={<ReportActions endpoint="sales" />} description="Paid orders and the revenue they brought in." title="Sales report" />
      <ReportError message={error} />

      <section className="grid gap-5 sm:grid-cols-3">
        <StatCard icon="report" isLoading={isLoading} isMoney label="Total revenue" value={summary?.totalRevenue} />
        <StatCard icon="orders" isLoading={isLoading} label="Paid orders" value={summary?.totalOrders} />
        <StatCard icon="discount" isLoading={isLoading} isMoney label="Avg order value" value={summary?.avgOrderValue} />
      </section>

      <ReportPanel
        action={<Pager meta={data?.orders.meta} onPage={setPage} />}
        emptyText="No paid orders in this period."
        isEmpty={!data?.orders.items.length}
        isLoading={isLoading}
        title="Orders"
      >
        <SalesOrdersTable orders={data?.orders.items ?? []} />
      </ReportPanel>

      <ReportPanel
        emptyText="No products sold in this period."
        isEmpty={!data?.productBreakdown.length}
        isLoading={isLoading}
        title="Sales by product"
      >
        <ProductBreakdownTable rows={data?.productBreakdown ?? []} />
      </ReportPanel>
    </>
  );
}
