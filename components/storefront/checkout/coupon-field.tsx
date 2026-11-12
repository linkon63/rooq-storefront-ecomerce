"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { quoteCoupon } from "@/lib/cart-api";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { couponApplied, couponRemoved, selectCouponCode } from "@/lib/store/slices/cart-slice";
import { errorText } from "@/utils/api-error";

/** Applies a code against the current subtotal (POST /coupons/apply); the order re-checks it. */
export function CouponField({ subtotal }: { subtotal: number }) {
  const dispatch = useAppDispatch();
  const applied = useAppSelector(selectCouponCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return setError(ERROR_MESSAGES.storefront.couponRequired);
    setSending(true);
    setError(null);
    try {
      const quote = await quoteCoupon(trimmed, subtotal);
      dispatch(couponApplied({ code: quote.code, discount: quote.discount }));
      toast.success(SUCCESS_MESSAGES.storefront.couponApplied(quote.code));
      setCode("");
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.storefront.couponFailed));
    } finally {
      setSending(false);
    }
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded border border-dashed border-ink px-3 py-2 text-sm">
        <span>
          Coupon <strong>{applied}</strong> applied
        </span>
        <button type="button" onClick={() => dispatch(couponRemoved())} className="font-semibold underline underline-offset-4">
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={apply} noValidate className="flex flex-col gap-1.5">
      <label htmlFor="coupon-code" className="text-sm font-semibold">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "coupon-error" : undefined}
          className="h-11 min-w-0 flex-1 rounded border border-line bg-paper px-3 text-base uppercase"
        />
        <button type="submit" disabled={sending} className="h-11 rounded border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-chalk disabled:opacity-60">
          Apply
        </button>
      </div>
      {error ? (
        <p id="coupon-error" role="alert" className="text-sm text-dye-deep">
          {error}
        </p>
      ) : null}
    </form>
  );
}
