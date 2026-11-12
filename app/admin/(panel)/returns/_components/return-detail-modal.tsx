"use client";

import type { ReturnRequestResponse, ReturnStatusInput } from "@/types/commerce/returns";
import { formatMoney } from "@/utils/admin/format";
import { formatDateTime } from "@/utils/format-date";
import { AdminIcon } from "../../../_components/admin-shell";
import { ReturnActionForm } from "./return-action-form";
import { ReturnItemList } from "./return-item-list";
import { ReturnStatusPill } from "./return-status-pill";

type Props = { request: ReturnRequestResponse; symbol: string; busy: boolean; onClose: () => void; onSubmit: (body: ReturnStatusInput) => void };

export function ReturnDetailModal({ request, symbol, busy, onClose, onSubmit }: Props) {
  return (
    <div aria-labelledby="return-detail-title" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center overscroll-contain bg-slate-950/50 px-4 py-6" role="dialog">
      <div className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-800" id="return-detail-title">
              {request.requestNumber}
              <ReturnStatusPill status={request.status} />
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {request.resolution === "REFUND" ? "Refund" : "Exchange"} · order {request.order.orderNumber} · opened {formatDateTime(request.createdAt)}
            </p>
          </div>
          <button aria-label="Close" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300" disabled={busy} onClick={onClose} type="button">
            <AdminIcon className="h-5 w-5" name="x" />
          </button>
        </div>
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</p>
            <p className="mt-1 font-semibold text-slate-800">{request.user?.name ?? "Guest"}</p>
            <p className="text-slate-600">{request.user?.email ?? ""}</p>
          </div>
          {request.customerNote ? (
            <div className="rounded-lg border border-slate-200 p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer note</p>
              <p className="mt-1 whitespace-pre-line text-slate-700">{request.customerNote}</p>
            </div>
          ) : null}
        </div>
        <ReturnItemList request={request} symbol={symbol} />
        {request.adminNote ? <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">Staff note: {request.adminNote}</p> : null}
        {request.refundAmount !== null ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Refunded {formatMoney(request.refundAmount, symbol)}</p>
        ) : null}
        <ReturnActionForm busy={busy} key={request.status} onSubmit={onSubmit} request={request} />
      </div>
    </div>
  );
}
