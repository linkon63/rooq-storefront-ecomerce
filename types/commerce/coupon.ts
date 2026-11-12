import type { CouponType } from "@/lib/generated/prisma/enums";

export type { CouponType };

export type CouponResponse = {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  /** null = unlimited */
  maxUsage: number | null;
  usedCount: number;
  minOrderAmount: number | null;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** POST /coupons/apply */
export type ApplyCouponResponse = {
  coupon: CouponResponse;
  discount: number;
  total: number;
};

/** Body of POST /coupons and PATCH /coupons/:id. */
export type CouponInput = {
  code: string;
  type: CouponType;
  value: number;
  maxUsage?: number | null;
  minOrderAmount?: number | null;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
};
