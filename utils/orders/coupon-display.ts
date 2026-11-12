import type { CouponResponse } from "@/types/commerce/coupon";

export type CouponState = "active" | "scheduled" | "expired" | "used-up" | "inactive";

/** Where a coupon stands right now — drives the status pill. */
export function couponState(coupon: CouponResponse, now: Date): CouponState {
  if (!coupon.isActive) return "inactive";
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return "expired";
  if (coupon.maxUsage !== null && coupon.usedCount >= coupon.maxUsage) return "used-up";
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return "scheduled";
  return "active";
}

export const COUPON_STATE_TONE: Record<CouponState, string> = {
  active: "border-emerald-300 bg-emerald-50 text-emerald-700",
  scheduled: "border-sky-300 bg-sky-50 text-sky-700",
  expired: "border-slate-300 bg-slate-50 text-slate-500",
  "used-up": "border-amber-300 bg-amber-50 text-amber-700",
  inactive: "border-rose-300 bg-rose-50 text-rose-700",
};

/** "20%" or "৳500" */
export function couponValueLabel(coupon: Pick<CouponResponse, "type" | "value">, symbol: string): string {
  return coupon.type === "percentage" ? `${coupon.value}%` : `${symbol}${coupon.value.toLocaleString("en")}`;
}

/** "3 / 100" or "3 / ∞" */
export function couponUsageLabel(coupon: Pick<CouponResponse, "usedCount" | "maxUsage">): string {
  return `${coupon.usedCount} / ${coupon.maxUsage ?? "∞"}`;
}

/** ISO → value for <input type="datetime-local"> (local time). */
export function toDateTimeInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value → ISO, or null when empty. */
export function fromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}
