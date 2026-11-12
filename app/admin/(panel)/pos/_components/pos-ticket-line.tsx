"use client";

import { formatMoney } from "@/utils/admin/format";
import { useAppDispatch } from "@/lib/store/hooks";
import { posActions, type PosLine } from "@/lib/store/slices/pos-slice";
import { AdminIcon } from "../../../_components/admin-shell";

export function PosTicketLine({ line, symbol }: { line: PosLine; symbol: string }) {
  const dispatch = useAppDispatch();
  const setQuantity = (quantity: number) => dispatch(posActions.setLineQuantity({ variantId: line.variantId, quantity }));

  return (
    <li className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <span aria-hidden className="h-8 w-8 shrink-0 rounded-full border border-slate-200" style={{ backgroundColor: line.colorHex }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{line.productName}</p>
        <p className="text-xs text-slate-500">
          {line.colorName} / {line.sizeLabel} · {formatMoney(line.unitPrice, symbol)}
        </p>
      </div>
      <div className="flex items-center rounded-lg border border-slate-200">
        <button aria-label="Decrease quantity" className="h-8 w-8 text-lg disabled:text-slate-300" disabled={line.quantity <= 1} onClick={() => setQuantity(line.quantity - 1)} type="button">
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
        <button aria-label="Increase quantity" className="h-8 w-8 text-lg disabled:text-slate-300" disabled={line.quantity >= line.stock} onClick={() => setQuantity(line.quantity + 1)} type="button">
          +
        </button>
      </div>
      <span className="w-20 text-right text-sm font-semibold tabular-nums">{formatMoney(line.unitPrice * line.quantity, symbol)}</span>
      <button aria-label={`Remove ${line.productName}`} className="text-slate-400 hover:text-rose-600" onClick={() => dispatch(posActions.removeLine(line.variantId))} type="button">
        <AdminIcon className="h-4 w-4" name="trash" />
      </button>
    </li>
  );
}
