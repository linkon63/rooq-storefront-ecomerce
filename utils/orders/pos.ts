import { roundMoney } from "@/utils/catalog/price";

export type PosTotals = { units: number; subtotal: number; discount: number; total: number };

/** Ticket totals before any coupon (the server applies the coupon at checkout). */
export function posTotals(lines: readonly { unitPrice: number; quantity: number }[], discount: number): PosTotals {
  let units = 0;
  let subtotal = 0;
  for (const line of lines) {
    units += line.quantity;
    subtotal += line.unitPrice * line.quantity;
  }
  subtotal = roundMoney(subtotal);
  const applied = roundMoney(Math.min(Math.max(discount, 0), subtotal));
  return { units, subtotal, discount: applied, total: roundMoney(subtotal - applied) };
}

/** Payment methods offered at the till (values match the PaymentMethod enum). */
export const POS_PAYMENT_METHODS: readonly { value: string; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "rocket", label: "Rocket" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
];
