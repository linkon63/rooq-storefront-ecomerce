import type { CouponType } from "@/lib/generated/prisma/enums";
import { toNumber, toNumberOrNull, type DecimalLike } from "@/utils/decimal";
import type { CouponResponse } from "@/types/commerce/coupon";
import type { CouponState } from "@/utils/orders/pricing";

export type CouponRow = {
  id: string;
  code: string;
  type: CouponType;
  value: DecimalLike;
  maxUsage: number | null;
  usedCount: number;
  minOrderAmount: DecimalLike | null;
  isActive: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toCouponResponse(row: CouponRow): CouponResponse {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: toNumber(row.value),
    maxUsage: row.maxUsage,
    usedCount: row.usedCount,
    minOrderAmount: toNumberOrNull(row.minOrderAmount),
    isActive: row.isActive,
    startsAt: row.startsAt ? row.startsAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** The fields `couponProblem()` checks, as plain numbers. */
export function toCouponState(row: CouponRow): CouponState {
  return {
    isActive: row.isActive,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    maxUsage: row.maxUsage,
    usedCount: row.usedCount,
    minOrderAmount: toNumberOrNull(row.minOrderAmount),
  };
}

/** Coupon codes are stored upper-case and matched case-insensitively. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}
