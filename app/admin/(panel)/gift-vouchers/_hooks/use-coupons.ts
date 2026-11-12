"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteCoupon, listCoupons, saveCoupon } from "@/lib/admin-api/commerce";
import type { CouponInput, CouponResponse } from "@/types/commerce/coupon";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";

const message = (error: unknown, fallback: string) => (error instanceof Error && error.message ? error.message : fallback);

export function useCoupons() {
  const [coupons, setCoupons] = useState<CouponResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      setCoupons(await listCoupons());
    } catch (err) {
      setError(message(err, ERROR_MESSAGES.coupon.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Returns the error text (for the form) or null on success. */
  async function save(input: Partial<CouponInput>, id?: string): Promise<string | null> {
    try {
      const saved = await saveCoupon(input, id);
      setCoupons((prev) => (id ? prev.map((c) => (c.id === id ? saved : c)) : [saved, ...prev]));
      toast.success(SUCCESS_MESSAGES.commerce.couponSaved);
      return null;
    } catch (err) {
      return message(err, ERROR_MESSAGES.coupon.saveFailed);
    }
  }

  async function remove(id: string) {
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      toast.success(SUCCESS_MESSAGES.commerce.couponDeleted);
    } catch (err) {
      toast.error(message(err, ERROR_MESSAGES.coupon.deleteFailed));
    }
  }

  async function toggle(coupon: CouponResponse) {
    const failure = await save({ isActive: !coupon.isActive }, coupon.id);
    if (failure) toast.error(failure);
  }

  return { coupons, isLoading, error, reload: load, save, remove, toggle };
}
