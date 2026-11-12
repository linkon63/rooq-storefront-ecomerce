"use client";

import { useMoney } from "@/hooks/use-money";
import { freeShippingGap } from "@/utils/storefront/cart";

/** "৳600 away from free delivery" with a progress bar, or a confirmation once reached. */
export function FreeShippingNote({ subtotal, threshold }: { subtotal: number; threshold: number | null }) {
  const format = useMoney();
  if (threshold === null || threshold <= 0) return null;
  const gap = freeShippingGap(subtotal, threshold);
  const progress = Math.min(100, Math.round((subtotal / threshold) * 100));
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm" aria-live="polite">
        {gap === null ? "Your order ships free." : `Add ${format(gap)} more for free delivery.`}
      </p>
      <div className="h-1 rounded-full bg-selvedge" aria-hidden>
        <div className="h-full rounded-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
