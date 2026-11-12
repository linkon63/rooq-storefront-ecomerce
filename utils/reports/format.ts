/** Formatting used by CSV / PDF report exports (pure). */

export function fixed2(value: number): string {
  return value.toFixed(2);
}

/** "BDT 1,234.50" — PDF core fonts cannot draw the ৳ sign. */
export function reportMoney(value: number, currency = "BDT"): string {
  return `${currency} ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "2026-05-01" */
export function isoDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
}

/** Customer label for an order row: account name → shipping name → "Guest". */
export function orderCustomerName(order: {
  user?: { name: string } | null;
  shippingAddress?: { fullName: string } | null;
}): string {
  return order.user?.name ?? order.shippingAddress?.fullName ?? "Guest";
}

/** StockMovementType ("RESTOCK") → the old lowercase reason ("restock"). */
export function movementReason(type: string): string {
  return type.toLowerCase();
}
