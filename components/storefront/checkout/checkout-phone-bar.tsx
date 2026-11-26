"use client";

import { useMoney } from "@/hooks/use-money";
import type { CheckoutStep } from "@/utils/storefront/checkout-steps";

type Props = {
  step: CheckoutStep;
  total: number;
  error: string | null;
  busy: boolean;
  blocked: boolean;
  onNext: () => void;
  onPlace: () => void;
};

/** Phones: running total with Continue, then Place order on the last step. */
export function CheckoutPhoneBar({ step, total, error, busy, blocked, onNext, onPlace }: Props) {
  const format = useMoney();
  const last = step === 3;
  return (
    <div data-action-bar="solo" className="mobile-action-bar flex flex-col gap-2 md:hidden">
      {error ? (
        <p role="alert" className="text-sm font-medium text-dye-deep">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-4">
        <p className="flex-1 text-sm text-stone">
          Total <strong className="block text-base text-ink tabular-nums">{format(total)}</strong>
        </p>
        <button
          type="button"
          disabled={last && (busy || blocked)}
          onClick={last ? onPlace : onNext}
          className="press h-12 w-44 rounded bg-ink text-sm font-semibold text-chalk disabled:opacity-60"
        >
          {last ? (busy ? "Placing order…" : "Place order") : "Continue"}
        </button>
      </div>
    </div>
  );
}
