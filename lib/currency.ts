import { API_PREFIX } from "@/lib/constants/storefront";
import { STORE_CURRENCY } from "@/lib/constants/store";
import { CURRENCY_SYMBOLS as SYMBOLS } from "@/utils/storefront/money";

/**
 * Module-level currency for code that renders outside React (invoices, admin
 * helpers). React code reads the Redux session slice via `useMoney()`.
 */

export const CURRENCY_SYMBOLS: Record<string, string> = SYMBOLS;

let cachedCurrency: string = STORE_CURRENCY;
let fetchPromise: Promise<void> | null = null;

/** Loads Settings.currency once per tab (browser only). */
export function ensureCurrencyLoaded(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (fetchPromise) return fetchPromise;
  fetchPromise = fetch(`${API_PREFIX}/settings`)
    .then((response) => (response.ok ? (response.json() as Promise<{ currency?: string } | null>) : null))
    .then((data) => {
      if (data?.currency) cachedCurrency = data.currency;
    })
    .catch(() => undefined);
  return fetchPromise;
}

export function getCurrencyCode(): string {
  return cachedCurrency;
}

export function getCurrencySymbol(code?: string): string {
  return CURRENCY_SYMBOLS[code ?? cachedCurrency] ?? CURRENCY_SYMBOLS[STORE_CURRENCY] ?? "৳";
}

export function formatCurrency(value?: string | number | null, symbol?: string): string {
  if (value === undefined || value === null || value === "") return "-";
  const sym = symbol ?? getCurrencySymbol();
  return `${sym}${Number(value).toLocaleString("en", { maximumFractionDigits: 2 })}`;
}
