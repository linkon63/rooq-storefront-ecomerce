"use client";

import { useCurrency } from "@/hooks/use-currency";
import type { ReturnStatus } from "@/types/commerce/returns";
import { AdminIcon, PageHeader } from "../../../_components/admin-shell";
import { useReturns } from "../_hooks/use-returns";
import { ReturnDetailModal } from "./return-detail-modal";
import { ReturnRow } from "./return-row";
import { ReturnStatusTabs } from "./return-status-tabs";

const HEADINGS = ["Request", "Order", "Customer", "Resolution", "Units · value", "Status", "Opened"];

export function ReturnsView({ initialStatus = "REQUESTED" }: { initialStatus?: ReturnStatus | "" }) {
  const { symbol } = useCurrency();
  const returns = useReturns(initialStatus);

  return (
    <>
      <PageHeader title="Returns & Exchanges" description="Review return requests on delivered orders: approve and restock, refund, exchange, or reject." />
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-600">{returns.total} requests</p>
          <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 px-4 focus-within:border-blue-500">
            <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
            <span className="sr-only">Search returns</span>
            <input
              className="w-full bg-transparent text-sm outline-none"
              onChange={(e) => returns.changeSearch(e.target.value)}
              placeholder="Return no., order no. or customer email…"
              type="search"
              value={returns.search}
            />
          </label>
        </div>
        <ReturnStatusTabs onChange={returns.selectStatus} value={returns.status} />
        {returns.error ? <p className="mx-5 mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{returns.error}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left">
            <thead className="bg-slate-50">
              <tr>
                {HEADINGS.map((h) => (
                  <th className="px-5 py-4 text-sm font-semibold text-slate-700" key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returns.isLoading ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                    Loading return requests…
                  </td>
                </tr>
              ) : returns.rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                    No return requests here.
                  </td>
                </tr>
              ) : (
                returns.rows.map((row) => <ReturnRow key={row.id} onOpen={() => returns.select(row.id)} request={row} symbol={symbol} />)
              )}
            </tbody>
          </table>
        </div>
        {returns.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-3 p-5 text-sm">
            <button className="h-9 rounded-lg border border-slate-300 px-3 disabled:opacity-40" disabled={returns.page <= 1} onClick={() => returns.setPage((p) => p - 1)} type="button">
              Previous
            </button>
            <span className="tabular-nums">
              {returns.page} / {returns.totalPages}
            </span>
            <button className="h-9 rounded-lg border border-slate-300 px-3 disabled:opacity-40" disabled={returns.page >= returns.totalPages} onClick={() => returns.setPage((p) => p + 1)} type="button">
              Next
            </button>
          </div>
        ) : null}
      </section>
      {returns.selected ? (
        <ReturnDetailModal
          busy={returns.isUpdating}
          onClose={() => returns.select(null)}
          onSubmit={(body) => {
            if (returns.selected) void returns.update(returns.selected.id, body);
          }}
          request={returns.selected}
          symbol={symbol}
        />
      ) : null}
    </>
  );
}
