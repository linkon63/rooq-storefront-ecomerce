"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { ShippingAddressInput } from "@/types/storefront/commerce";
import { checkoutStepFrom, type CheckoutStep } from "@/utils/storefront/checkout-steps";
import { addressProblem } from "@/utils/storefront/forms";

/**
 * The phone checkout's step, kept in `?step=` so the back button works. An
 * unfinished address (null = a saved one is chosen) holds the shopper on step 1.
 */
export function useCheckoutStep(newAddress: ShippingAddressInput | null) {
  const router = useRouter();
  const requested = checkoutStepFrom(useSearchParams().get("step"));
  const [error, setError] = useState<string | null>(null);
  const problem = newAddress ? addressProblem(newAddress) : null;
  const step: CheckoutStep = problem ? 1 : requested;

  function goTo(target: CheckoutStep) {
    if (target > 1 && problem) return setError(problem);
    setError(null);
    router.push(`/checkout?step=${target}`);
  }

  const next = () => goTo(step === 1 ? 2 : 3);

  return { step, goTo, next, error: step === 1 && problem ? error : null };
}
