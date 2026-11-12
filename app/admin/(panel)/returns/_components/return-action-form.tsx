"use client";

import { useState } from "react";
import type { ReturnRequestResponse, ReturnStatus, ReturnStatusInput } from "@/types/commerce/returns";
import { nextReturnStatuses } from "@/utils/orders/returns";
import { RETURN_ACTION_LABEL, returnValue } from "@/utils/orders/return-display";

const TONE: Partial<Record<ReturnStatus, string>> = {
  APPROVED: "bg-emerald-600 hover:bg-emerald-700",
  REFUNDED: "bg-blue-600 hover:bg-blue-700",
  EXCHANGED: "bg-violet-600 hover:bg-violet-700",
  REJECTED: "bg-red-600 hover:bg-red-700",
  CANCELLED: "bg-slate-500 hover:bg-slate-600",
};

type Props = { request: ReturnRequestResponse; busy: boolean; onSubmit: (body: ReturnStatusInput) => void };

/**
 * The next legal steps only: REQUESTED → approve / reject / cancel, then
 * APPROVED → refunded (refund) or exchanged (exchange).
 */
export function ReturnActionForm({ request, busy, onSubmit }: Props) {
  const actions = nextReturnStatuses(request.status, request.resolution);
  const [adminNote, setAdminNote] = useState("");
  const [restock, setRestock] = useState(true);
  const [refund, setRefund] = useState(String(returnValue(request)));
  if (!actions.length) return null;

  const showsRefund = actions.includes("REFUNDED");
  return (
    <div className="mt-6 rounded-lg border border-slate-200 p-4">
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Note to the customer (optional)</span>
        <textarea className="h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500" onChange={(e) => setAdminNote(e.target.value)} value={adminNote} />
      </label>
      {actions.includes("APPROVED") ? (
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input checked={restock} onChange={(e) => setRestock(e.target.checked)} type="checkbox" />
          Put the returned units back into stock when approving
        </label>
      ) : null}
      {showsRefund ? (
        <label className="mt-3 block max-w-xs">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Refund amount</span>
          <input className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500" inputMode="decimal" min={0} onChange={(e) => setRefund(e.target.value)} step="0.01" type="number" value={refund} />
        </label>
      ) : null}
      <div className="mt-4 flex flex-wrap justify-end gap-3">
        {actions.map((status) => (
          <button
            className={`h-11 rounded-lg px-5 text-sm font-semibold text-white transition-colors disabled:bg-slate-400 ${TONE[status] ?? "bg-slate-700"}`}
            disabled={busy}
            key={status}
            onClick={() =>
              onSubmit({
                status,
                adminNote: adminNote.trim() || undefined,
                ...(status === "APPROVED" ? { restock } : {}),
                ...(status === "REFUNDED" && refund !== "" ? { refundAmount: Number(refund) } : {}),
              })
            }
            type="button"
          >
            {RETURN_ACTION_LABEL[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
