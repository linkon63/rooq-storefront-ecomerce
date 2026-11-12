"use client";

import { formatMoney } from "@/utils/admin/format";
import { useAppSelector } from "@/lib/store/hooks";
import { selectPos } from "@/lib/store/slices/pos-slice";
import { posTotals } from "@/utils/orders/pos";
import { PosCheckoutForm } from "./pos-checkout-form";
import { PosTicketLine } from "./pos-ticket-line";

type Props = { symbol: string; isSubmitting: boolean; onCheckout: () => void };

export function PosTicket({ symbol, isSubmitting, onCheckout }: Props) {
  const sale = useAppSelector(selectPos);
  const totals = posTotals(sale.lines, sale.discount);

  return (
    <aside className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-xs xl:sticky xl:top-6">
      <h2 className="text-xl font-semibold text-slate-900">Current sale</h2>
      {sale.lines.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">Pick a product, then its colour and size.</p>
      ) : (
        <ul className="mt-3">
          {sale.lines.map((line) => (
            <PosTicketLine key={line.variantId} line={line} symbol={symbol} />
          ))}
        </ul>
      )}
      <div className="mt-5 border-t border-slate-100 pt-5">
        <PosCheckoutForm />
      </div>
      <dl className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal ({totals.units} units)</dt>
          <dd className="tabular-nums">{formatMoney(totals.subtotal, symbol)}</dd>
        </div>
        <div className="flex justify-between text-rose-600">
          <dt>Discount</dt>
          <dd className="tabular-nums">- {formatMoney(totals.discount, symbol)}</dd>
        </div>
        {sale.couponCode.trim() ? <p className="text-xs text-slate-500">The coupon is checked and applied when the sale completes.</p> : null}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatMoney(totals.total, symbol)}</dd>
        </div>
      </dl>
      <button
        className="mt-6 h-12 w-full rounded-lg bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 disabled:bg-slate-300"
        disabled={isSubmitting || sale.lines.length === 0}
        onClick={onCheckout}
        type="button"
      >
        {isSubmitting ? "Completing sale…" : "Complete sale"}
      </button>
    </aside>
  );
}
