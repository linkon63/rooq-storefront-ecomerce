"use client";

import { useState } from "react";
import { toast } from "sonner";
import { catalogApi } from "@/lib/admin-api/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { BACK_IN_STOCK_STATUSES } from "@/lib/constants/catalog";
import { errorText } from "@/utils/error-text";
import type { AdminBackInStock } from "@/types/catalog-admin";
import { PageHeader } from "../../_components/admin-ui";
import { useAsyncData } from "../_catalog/use-async-data";
import { Card } from "../_catalog/table";
import { Pager } from "../_catalog/pager";
import { SelectInput, TextInput } from "../_catalog/field";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "../_catalog/data-states";
import { DemandSummary } from "./_components/demand-summary";
import { RequestTable } from "./_components/request-table";

export default function BackInStockPage() {
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: "25", ...(status ? { status } : {}), ...(search.trim() ? { search: search.trim() } : {}) });
  const requests = useAsyncData(() => catalogApi.backInStock.list(params), params.toString());
  const summary = useAsyncData(() => catalogApi.backInStock.summary(), "bis-summary");

  async function remove(row: AdminBackInStock) {
    try {
      await catalogApi.backInStock.remove(row.id);
      toast.success(SUCCESS_MESSAGES.common.deleted("Request"));
      await Promise.all([requests.reload(), summary.reload()]);
    } catch (err) {
      toast.error(errorText(err, ERROR_MESSAGES.ui.deleteFailed));
    }
  }

  return (
    <div className="grid gap-6 pb-10">
      <PageHeader title="Back-in-stock requests" description="Shoppers waiting for a sold-out size. Use it to decide what to restock first." />
      {summary.error ? <ErrorBlock message={summary.error} onRetry={summary.reload} /> : null}
      {summary.data ? <DemandSummary rows={summary.data} onNotified={() => { void summary.reload(); void requests.reload(); }} /> : summary.loading ? <LoadingBlock label="Loading demand" /> : null}
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="mr-auto font-semibold text-slate-900">All requests</h2>
          <div className="w-44">
            <SelectInput aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">Any status</option>
              {BACK_IN_STOCK_STATUSES.map((s) => <option key={s} value={s}>{s.toLowerCase()}</option>)}
            </SelectInput>
          </div>
          <div className="w-64"><TextInput type="search" aria-label="Search requests" placeholder="Email, product or SKU" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        </div>
        {requests.loading ? <LoadingBlock label="Loading requests" /> : null}
        {requests.error ? <div className="p-4"><ErrorBlock message={requests.error} onRetry={requests.reload} /></div> : null}
        {requests.data && !requests.loading ? (
          requests.data.data.length ? (
            <>
              <RequestTable rows={requests.data.data} onDelete={remove} />
              <Pager page={requests.data.meta.page} totalPages={requests.data.meta.totalPages} total={requests.data.meta.total} onPage={setPage} />
            </>
          ) : (
            <EmptyBlock title="No requests match" body="Try another status or clear the search." />
          )
        ) : null}
      </Card>
    </div>
  );
}
