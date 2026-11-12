"use client";

import type { WholesaleRequestResponse as WholesaleOrderRequest } from "@/types/commerce/wholesale";
import { AdminIcon } from "../../../_components/admin-shell";
import { WholesaleActions } from "./wholesale-actions";
import { WholesaleItemsTable } from "./wholesale-items-table";
import { WholesaleStatusPill } from "./wholesale-status-pill";

type Props = {
  request: WholesaleOrderRequest;
  symbol: string;
  busy: boolean;
  onClose: () => void;
  onStatus: (status: "approved" | "rejected" | "info_requested", note?: string) => Promise<boolean>;
  onConvert: () => void;
};

export function WholesaleDetailModal({ request, symbol, busy, onClose, onStatus, onConvert }: Props) {
  return (
    <div aria-labelledby="wholesale-detail-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-slate-950/50 px-4 py-6" role="dialog">
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800" id="wholesale-detail-title">
              Request {request.requestNumber}
            </h2>
            <div className="mt-2">
              <WholesaleStatusPill status={request.status} />
            </div>
          </div>
          <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300" disabled={busy} onClick={onClose} type="button">
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
            <p className="mt-1 font-semibold text-slate-800">{request.user.name}</p>
            <p className="text-slate-600">{request.user.email ?? ""}</p>
            <p className="text-slate-600">{request.contactPhone ?? request.user.phone ?? "No phone"}</p>
          </div>
          {request.customerNote ? (
            <div className="rounded-lg border border-slate-200 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer note</p>
              <p className="mt-1 text-slate-700">{request.customerNote}</p>
            </div>
          ) : null}
        </div>
        <WholesaleItemsTable request={request} symbol={symbol} />
        {request.infoRequestMessage ? <p className="mt-4 rounded-lg bg-sky-50 px-4 py-3 text-sm text-sky-800">Asked the customer: {request.infoRequestMessage}</p> : null}
        {request.status === "rejected" && request.adminNote ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">Rejection note: {request.adminNote}</p>
        ) : null}
        {request.order ? (
          <p className="mt-4 rounded-lg bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-700">Converted to order {request.order.orderNumber}</p>
        ) : null}
        <WholesaleActions busy={busy} key={request.status} onConvert={onConvert} onStatus={onStatus} request={request} />
      </div>
    </div>
  );
}
