import type { InvoiceSummary } from "@/utils/orders/invoice-summary";

const ROW = "flex justify-between";

export function InvoiceTotals({ summary, money }: { summary: InvoiceSummary; money: (value: number) => string }) {
  const { subtotal, productDiscount, couponDiscount, deliveryCharge, payable, totalDiscount, savedPercent, isCod } = summary;
  return (
    <div className="invoice-keep mt-6 flex flex-col items-end">
      <div className="w-full space-y-2 text-xs tabular-nums text-stone-700 sm:w-72 print:w-72">
        <div className={ROW}>
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900">{money(subtotal)}</span>
        </div>
        {productDiscount > 0 ? (
          <div className={`${ROW} text-dye-deep`}>
            <span>Product Discount</span>
            <span className="font-semibold">-{money(productDiscount)}</span>
          </div>
        ) : null}
        {couponDiscount > 0 ? (
          <div className={`${ROW} text-dye-deep`}>
            <span>Coupon Discount</span>
            <span className="font-semibold">-{money(couponDiscount)}</span>
          </div>
        ) : null}
        <div className={ROW}>
          <span>Delivery Charge</span>
          <span className="font-semibold text-stone-900">{deliveryCharge > 0 ? money(deliveryCharge) : "Free"}</span>
        </div>
        <div className={`${ROW} border-t-2 border-ink pt-2 text-sm font-bold text-ink`}>
          <span>{isCod ? "Payable on Delivery" : "Payable Amount"}</span>
          <span>{money(payable)}</span>
        </div>
        {totalDiscount > 0 ? (
          <div className={`${ROW} rounded bg-chalk px-3 py-2 font-semibold text-dye-deep`}>
            <span>You saved</span>
            <span>
              {money(totalDiscount)}
              {savedPercent > 0 ? ` (${savedPercent}%)` : ""}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
