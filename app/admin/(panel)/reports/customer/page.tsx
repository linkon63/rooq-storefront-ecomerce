"use client";

import { PageHeader } from "../../../_components/page-header";
import type { UserReport } from "@/types/admin/reports";
import { ReportActions } from "../_components/report-actions";
import { ReportError } from "../_components/report-error";
import { ReportPanel } from "../_components/report-panel";
import { StatCard } from "../_components/stat-card";
import { Pager } from "../_components/pager";
import { useReport } from "../_hooks/use-report";
import { CustomersTable } from "./_components/customers-table";

export default function CustomerReportPage() {
  const { data, isLoading, error, setPage } = useReport<UserReport>("users");
  const summary = data?.summary;

  return (
    <>
      <PageHeader action={<ReportActions endpoint="users" />} description="Who signed up, and when." title="Customer report" />
      <ReportError message={error} />

      <section className="grid gap-5 sm:grid-cols-3">
        <StatCard icon="store" isLoading={isLoading} label="All customers" value={summary?.totalCustomers} />
        <StatCard icon="calendar" isLoading={isLoading} label="New this week" value={summary?.newCustomersThisWeek} />
        <StatCard icon="user" isLoading={isLoading} label="New in this period" value={summary?.totalNewUsers} />
      </section>

      <ReportPanel
        action={<Pager meta={data?.users.meta} onPage={setPage} />}
        emptyText="No customers signed up in this period."
        isEmpty={!data?.users.items.length}
        isLoading={isLoading}
        title="New customers"
      >
        <CustomersTable users={data?.users.items ?? []} />
      </ReportPanel>
    </>
  );
}
