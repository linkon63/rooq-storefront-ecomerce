"use client";

import { useCallback, useEffect } from "react";
import { ensureCurrencyLoaded, formatCurrency, getCurrencyCode } from "@/lib/currency";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { currencySet, selectCurrency } from "@/lib/store/slices/session-slice";
import { currencySymbol } from "@/utils/storefront/money";

type CurrencyValue = {
  currency: string;
  symbol: string;
  formatCurrency: (value?: string | number | null) => string;
};

/** Loads the store currency from Settings into the Redux session slice once. */
export function useLoadCurrency(): void {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void ensureCurrencyLoaded().then(() => dispatch(currencySet(getCurrencyCode())));
  }, [dispatch]);
}

/** The store currency (from Redux) and a formatter bound to its symbol. */
export function useCurrency(): CurrencyValue {
  const currency = useAppSelector(selectCurrency);
  const symbol = currencySymbol(currency);
  const format = useCallback((value?: string | number | null) => formatCurrency(value, symbol), [symbol]);
  return { currency, symbol, formatCurrency: format };
}
