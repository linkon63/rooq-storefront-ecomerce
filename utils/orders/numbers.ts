/** Human-facing reference numbers for orders, invoices, returns and wholesale requests. */

/** The shop's calendar decides which year/day a number belongs to. */
export const SHOP_TIME_ZONE = "Asia/Dhaka";

/** Unambiguous upper-case alphabet (no 0/O, 1/I/L) for random suffixes. */
export const REFERENCE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export const REFERENCE_CODE_LENGTH = 6;

export function yearIn(at: Date, timeZone: string = SHOP_TIME_ZONE): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric" }).format(at));
}

/** "260512" — yymmdd in the shop's time zone. */
export function dayStamp(at: Date, timeZone: string = SHOP_TIME_ZONE): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone, year: "2-digit", month: "2-digit", day: "2-digit" }).formatToParts(at);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${part("year")}${part("month")}${part("day")}`;
}

/** "INV-2026-000123" */
export function formatInvoiceNumber(year: number, sequence: number): string {
  return `INV-${year}-${String(sequence).padStart(6, "0")}`;
}

/** "ORD-260512-4F7K2Q" */
export function formatOrderNumber(at: Date, code: string): string {
  return `ORD-${dayStamp(at)}-${code}`;
}

/** "RET-2026-4F7K2Q" */
export function formatReturnNumber(at: Date, code: string): string {
  return `RET-${yearIn(at)}-${code}`;
}

/** "WSR-260512-4F7K2Q" */
export function formatWholesaleNumber(at: Date, code: string): string {
  return `WSR-${dayStamp(at)}-${code}`;
}

/** Maps random integers (0 ≤ n < alphabet length) to a reference code. */
export function codeFromIndexes(indexes: readonly number[], alphabet: string = REFERENCE_ALPHABET): string {
  return indexes.map((index) => alphabet[index % alphabet.length]).join("");
}
