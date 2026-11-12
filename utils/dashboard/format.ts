import type { ChartGranularity } from "@/types/dashboard";

export function formatCount(value: number): string {
  return value.toLocaleString("en");
}

/** Chart axis label for a sales-trend bucket. */
export function formatBucket(date: string, granularity: ChartGranularity): string {
  const d = new Date(date);
  if (granularity === "yearly") return new Intl.DateTimeFormat("en", { year: "numeric" }).format(d);
  return new Intl.DateTimeFormat(
    "en",
    granularity === "monthly" ? { month: "short", year: "2-digit" } : { month: "short", day: "numeric" },
  ).format(d);
}

/** Text colour for a payment status label. */
export function paymentTone(status: string): string {
  if (status === "paid") return "text-emerald-600";
  if (status === "refunded" || status === "partially_refunded") return "text-amber-600";
  return "text-rose-600";
}

/** Axis tick: 12500 → "12.5k". */
export function compactAmount(value: number): string {
  return value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value);
}

/** "YYYY-MM-DD" for a local date. */
export function isoDay(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 1 January → 31 December of the given year, as ISO days. */
export function yearRange(year: number): { startDate: string; endDate: string } {
  return { startDate: `${year}-01-01`, endDate: `${year}-12-31` };
}
