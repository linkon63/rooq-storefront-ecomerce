"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { posActions, selectPos, type PosCustomer } from "@/lib/store/slices/pos-slice";
import { POS_PAYMENT_METHODS } from "@/utils/orders/pos";

const INPUT = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

/** Customer (optional), payment, coupon and staff discount for the sale. */
export function PosCheckoutForm() {
  const dispatch = useAppDispatch();
  const sale = useAppSelector(selectPos);
  const setCustomer = (field: keyof PosCustomer) => (event: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(posActions.setCustomerField({ field, value: event.target.value }));

  return (
    <div className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Customer name">
          <input autoComplete="off" className={INPUT} name="customerName" onChange={setCustomer("name")} placeholder="Walk-in customer…" value={sale.customer.name} />
        </Field>
        <Field label="Phone">
          <input autoComplete="off" className={INPUT} inputMode="tel" name="customerPhone" onChange={setCustomer("phone")} placeholder="01XXXXXXXXX…" type="tel" value={sale.customer.phone} />
        </Field>
      </div>
      <Field label="Email (receipt)">
        <input autoComplete="off" className={INPUT} name="customerEmail" onChange={setCustomer("email")} spellCheck={false} type="email" value={sale.customer.email} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Payment method">
          <select className={INPUT} onChange={(e) => dispatch(posActions.setPaymentMethod(e.target.value))} value={sale.paymentMethod}>
            {POS_PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transaction ID">
          <input autoComplete="off" className={INPUT} onChange={(e) => dispatch(posActions.setTransactionId(e.target.value))} spellCheck={false} value={sale.transactionId} />
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Coupon code">
          <input autoComplete="off" className={`${INPUT} uppercase`} onChange={(e) => dispatch(posActions.setCouponCode(e.target.value))} spellCheck={false} value={sale.couponCode} />
        </Field>
        <Field label="Discount (amount)">
          <input
            className={INPUT}
            inputMode="decimal"
            min={0}
            onChange={(e) => dispatch(posActions.setDiscount(Number(e.target.value)))}
            step="0.01"
            type="number"
            value={sale.discount || ""}
          />
        </Field>
      </div>
      <Field label="Note">
        <input autoComplete="off" className={INPUT} onChange={(e) => dispatch(posActions.setNote(e.target.value))} value={sale.note} />
      </Field>
    </div>
  );
}
