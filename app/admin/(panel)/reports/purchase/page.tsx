"use client";

import { PageHeader } from "../../../_components/page-header";
import type { PurchaseReport } from "@/types/reports";
import { ReportActions } from "../_components/report-actions";
import { ReportError } from "../_components/report-error";
import { ReportPanel } from "../_components/report-panel";
import { StatCard } from "../_components/stat-card";
import { Pager } from "../_components/pager";
import { useReport } from "../_hooks/use-report";
import { PurchasesTable } from "./_components/purchases-table";

export default function PurchaseReportPage() {
  const { data, isLoading, error, setPage } = useReport<PurchaseReport>("purchases");
  const summary = data?.summary;

  return (
    <>
      <PageHeader
        action={<ReportActions endpoint="purchases" />}
        description="Restocks recorded in inventory, valued at each variant's cost price."
        title="Purchase report"
      />
      <ReportError message={error} />

      <section className="grid gap-5 sm:grid-cols-3">
        <StatCard icon="suppliers" isLoading={isLoading} label="Restocks" value={summary?.totalPurchases} />
        <StatCard icon="package" isLoading={isLoading} label="Units restocked" value={summary?.totalUnits} />
        <StatCard icon="report" isLoading={isLoading} isMoney label="Total cost" value={summary?.totalCost} />
      </section>

      <ReportPanel
        action={<Pager meta={data?.purchases.meta} onPage={setPage} />}
        emptyText="No restocks in this period. Restocks are recorded from Stock → Adjust inventory."
        isEmpty={!data?.purchases.items.length}
        isLoading={isLoading}
        title="Restocks"
      >
        <PurchasesTable rows={data?.purchases.items ?? []} />
      </ReportPanel>
    </>
  );
}
