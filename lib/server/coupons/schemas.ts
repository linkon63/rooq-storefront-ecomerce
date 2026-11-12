import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;

const dateOrNull = z.iso.datetime({ offset: true }).nullable().optional();
const money = z.coerce.number().min(0);

const couponFields = {
  code: z.string({ error: v.required("code") }).trim().min(1, ERROR_MESSAGES.coupon.codeRequired).max(40),
  type: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive(ERROR_MESSAGES.coupon.valueRequired),
  /** null = unlimited */
  maxUsage: z.coerce.number().int().min(1).nullable().optional(),
  minOrderAmount: money.nullable().optional(),
  isActive: z.boolean().optional(),
  startsAt: dateOrNull,
  expiresAt: dateOrNull,
};

function checkCoupon(
  value: { type?: "percentage" | "fixed"; value?: number; startsAt?: string | null; expiresAt?: string | null },
  ctx: z.RefinementCtx,
) {
  if (value.type === "percentage" && value.value !== undefined && value.value > 100) {
    ctx.addIssue({ code: "custom", path: ["value"], message: ERROR_MESSAGES.coupon.percentageTooHigh });
  }
  if (value.startsAt && value.expiresAt && new Date(value.expiresAt) <= new Date(value.startsAt)) {
    ctx.addIssue({ code: "custom", path: ["expiresAt"], message: ERROR_MESSAGES.coupon.invalidWindow });
  }
}

/** POST /coupons — CreateCouponDto (+ minOrderAmount, isActive, startsAt; maxUsage now optional). */
export const createCouponSchema = z.strictObject(couponFields).superRefine(checkCoupon);

/** PATCH /coupons/:id — every field optional; null clears a date / limit. */
export const updateCouponSchema = z.strictObject(couponFields).partial().superRefine(checkCoupon);

/** POST /coupons/apply — ApplyCouponDto */
export const applyCouponSchema = z.strictObject({
  code: z.string({ error: v.required("code") }).trim().min(1, ERROR_MESSAGES.coupon.codeRequired),
  subtotal: money,
});

export type CreateCouponInput = z.output<typeof createCouponSchema>;
export type UpdateCouponInput = z.output<typeof updateCouponSchema>;
export type ApplyCouponInput = z.output<typeof applyCouponSchema>;
