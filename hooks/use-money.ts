"use client";

import { useCallback } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCurrency } from "@/lib/store/slices/session-slice";
import { formatMoney } from "@/utils/storefront/money";

/** `format(2450)` → "৳2,450" in the store currency from Settings. */
export function useMoney() {
  const currency = useAppSelector(selectCurrency);
  return useCallback((amount: number) => formatMoney(amount, currency), [currency]);
}
