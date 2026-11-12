"use client";

import type { ReturnRequestResponse } from "@/types/commerce/returns";
import { formatMoney } from "@/utils/admin/format";
import { formatDateTime } from "@/utils/format-date";
import { returnUnits, returnValue } from "@/utils/orders/return-display";
import { ReturnStatusPill } from "./return-status-pill";

export function ReturnRow({ request, symbol, onOpen }: { request: ReturnRequestResponse; symbol: string; onOpen: () => void }) {
  return (
    <tr className="cursor-pointer odd:bg-white even:bg-slate-50/70 hover:bg-slate-50" onClick={onOpen}>
      <td className="px-5 py-4">
        <button className="font-mono text-sm font-semibold text-slate-800 hover:underline" onClick={onOpen} type="button">
          {request.requestNumber}
        </button>
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">{request.order.orderNumber}</td>
      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-slate-800">{request.user?.name ?? "Guest"}</p>
        <p className="text-xs text-slate-400">{request.user?.email ?? ""}</p>
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">{request.resolution === "REFUND" ? "Refund" : "Exchange"}</td>
      <td className="px-5 py-4 text-sm tabular-nums text-slate-700">
        {returnUnits(request)} · {formatMoney(request.refundAmount ?? returnValue(request), symbol)}
      </td>
      <td className="px-5 py-4">
        <ReturnStatusPill status={request.status} />
      </td>
      <td className="px-5 py-4 text-xs text-slate-500">{formatDateTime(request.createdAt)}</td>
    </tr>
  );
}
