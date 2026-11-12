"use client";

import { PageHeader } from "../../../_components/page-header";
import type { InventoryReport } from "@/types/reports";
import { ReportActions } from "../_components/report-actions";
import { ReportError } from "../_components/report-error";
import { ReportPanel } from "../_components/report-panel";
import { StatCard } from "../_components/stat-card";
import { Pager } from "../_components/pager";
import { useReport } from "../_hooks/use-report";
import { StockChangesTable } from "./_components/stock-changes-table";
import { LowStockTable } from "./_components/low-stock-table";

export default function InventoryReportPage() {
  const { data, isLoading, error, setPage } = useReport<InventoryReport>("inventory");
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        action={<ReportActions endpoint="inventory" />}
        description="Every stock movement per size and colour, and what is running low."
        title="Inventory report"
      />
      <ReportError message={error} />

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon="arrow-right" isLoading={isLoading} label="Units in" value={summary?.totalStockIn} />
        <StatCard icon="arrow-left" isLoading={isLoading} label="Units out" value={summary?.totalStockOut} />
        <StatCard icon="stock" isLoading={isLoading} label="Movements" value={summary?.totalTransactions} />
        <StatCard icon="info" isLoading={isLoading} label="Low-stock variants" value={summary?.lowStockAlerts} />
      </section>

      <ReportPanel
        emptyText="Every variant is above its low-stock threshold."
        isEmpty={!data?.lowStockAlerts.length}
        isLoading={isLoading}
        title="Running low"
      >
        <LowStockTable rows={data?.lowStockAlerts ?? []} />
      </ReportPanel>

      <ReportPanel
        action={<Pager meta={data?.stockChanges.meta} onPage={setPage} />}
        emptyText="No stock movements in this period."
        isEmpty={!data?.stockChanges.items.length}
        isLoading={isLoading}
        title="Stock movements"
      >
        <StockChangesTable rows={data?.stockChanges.items ?? []} />
      </ReportPanel>
    </>
  );
}
