"use client";

import { useMemo, useState } from "react";
import type { WholesaleRequestResponse as WholesaleOrderRequest } from "@/types/commerce/wholesale";
import { formatDate } from "@/utils/format-date";
import { AdminIcon } from "../../../_components/admin-shell";
import type { WholesaleFilter } from "../_hooks/use-wholesale-requests";
import { WholesaleStatusPill } from "./wholesale-status-pill";

const TABS: { value: WholesaleFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "info_requested", label: "Info requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "converted", label: "Converted" },
];
const HEADINGS = ["Request #", "Customer", "Lines", "Total qty", "Status", "Created"];

type Props = {
  requests: WholesaleOrderRequest[];
  isLoading: boolean;
  error: string;
  filter: WholesaleFilter;
  onFilter: (value: WholesaleFilter) => void;
  onOpen: (request: WholesaleOrderRequest) => void;
};

export function WholesaleTable({ requests, isLoading, error, filter, onFilter, onOpen }: Props) {
  const [search, setSearch] = useState("");
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((r) => `${r.requestNumber} ${r.user.name} ${r.user.email ?? ""}`.toLowerCase().includes(query));
  }, [requests, search]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">Displaying {visible.length} requests</p>
        <label className="flex h-11 w-full max-w-md items-center gap-3 rounded-lg border-2 border-slate-200 px-4 focus-within:border-blue-500">
          <AdminIcon className="h-5 w-5 text-slate-400" name="search" />
          <span className="sr-only">Search requests</span>
          <input className="w-full bg-transparent text-sm outline-none" onChange={(e) => setSearch(e.target.value)} placeholder="Request #, customer name or email…" type="search" value={search} />
        </label>
      </div>
      <div className="flex flex-wrap gap-2 px-5 pb-4" role="tablist">
        {TABS.map((tab) => (
          <button
            aria-selected={filter === tab.value}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === tab.value ? "bg-blue-600 text-white" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}
            key={tab.value}
            onClick={() => onFilter(tab.value)}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {error ? <p className="mx-5 mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
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
            {isLoading ? (
              <tr>
                <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                  Loading wholesale requests…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-sm font-semibold text-slate-500" colSpan={HEADINGS.length}>
                  No wholesale requests found.
                </td>
              </tr>
            ) : (
              visible.map((request) => (
                <tr className="cursor-pointer odd:bg-white even:bg-slate-50/70 hover:bg-slate-50" key={request.id} onClick={() => onOpen(request)}>
                  <td className="px-5 py-4">
                    <button className="font-mono text-sm font-semibold text-slate-800 hover:underline" onClick={() => onOpen(request)} type="button">
                      {request.requestNumber}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">{request.user.name}</p>
                    <p className="text-xs text-slate-400">{request.user.email ?? ""}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-700">{request.items.length}</td>
                  <td className="px-5 py-4 text-sm tabular-nums text-slate-700">{request.items.reduce((s, i) => s + i.requestedQuantity, 0)}</td>
                  <td className="px-5 py-4">
                    <WholesaleStatusPill status={request.status} />
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDate(request.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
