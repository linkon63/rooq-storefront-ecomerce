export const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  SAR: "﷼",
  AED: "د.إ",
};

export function currencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

/** `2450` → `৳2,450`; keeps up to two decimals only when they are not zero. */
export function formatMoney(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${currencySymbol(currency)}${formatted}`;
}

/** A price as a number, whatever the API sent (Decimal strings included). */
export function toAmount(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}
