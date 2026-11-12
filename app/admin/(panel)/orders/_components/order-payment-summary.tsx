import { formatMoney } from "@/utils/admin/format";
import type { OrderTotals } from "@/utils/orders/display";

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between">
      <span className="font-medium text-slate-500">{label}</span>
      <span className={`font-semibold tabular-nums ${tone ?? "text-slate-800"}`}>{value}</span>
    </div>
  );
}

type Props = { totals: OrderTotals; symbol: string; couponCode: string | null; showSettlement: boolean; awaitingCod: boolean };

export function OrderPaymentSummary({ totals, symbol, couponCode, showSettlement, awaitingCod }: Props) {
  const money = (value: number) => formatMoney(value, symbol);
  const saving = totals.productDiscount + totals.discount;
  const savedPercent = totals.subtotal > 0 && saving > 0 ? Math.round((saving / totals.subtotal) * 100) : 0;

  return (
    <div className="h-fit shrink-0 rounded-lg border border-slate-200/60 bg-slate-50/80 p-4">
      <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Payment summary</h4>
      <div className="space-y-2.5 text-xs text-slate-600">
        <Row label="Subtotal" value={money(totals.subtotal)} />
        {totals.productDiscount > 0 ? <Row label="Product offers" value={`- ${money(totals.productDiscount)}`} tone="text-emerald-600" /> : null}
        {totals.discount > 0 ? <Row label={couponCode ? `Coupon (${couponCode})` : "Discount"} value={`- ${money(totals.discount)}`} tone="text-rose-600" /> : null}
        <Row label="Delivery" value={money(totals.shipping)} />
        {totals.tax > 0 ? <Row label="Tax" value={money(totals.tax)} /> : null}
        <div className="flex items-center justify-between border-t border-slate-200/60 pt-2.5">
          <span className="text-[13px] font-semibold text-slate-800">Total</span>
          <span className="text-[15px] font-semibold text-slate-900 tabular-nums">{money(totals.grand)}</span>
        </div>
        {saving > 0 ? (
          <Row label="Customer saved" value={`${money(saving)}${savedPercent ? ` (${savedPercent}%)` : ""}`} tone="text-emerald-700" />
        ) : null}
        {showSettlement ? (
          <>
            <Row label="Paid" value={money(totals.paid)} tone="text-emerald-600" />
            {totals.refunded > 0 ? <Row label="Refunded" value={money(totals.refunded)} tone="text-amber-600" /> : null}
            <Row label="Due" value={money(totals.due)} tone="text-rose-600" />
          </>
        ) : null}
        {awaitingCod ? (
          <p className="mt-1 rounded-md border border-amber-100 bg-amber-50/60 px-2 py-1.5 text-[11px] font-semibold text-amber-700">
            Collect {money(totals.grand)} from the courier, then mark the payment received.
          </p>
        ) : null}
      </div>
    </div>
  );
}
