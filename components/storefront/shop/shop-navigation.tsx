"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useCallback, useMemo, useTransition, type ReactNode } from "react";
import type { ProductFacets } from "@/types/storefront/catalog";
import { withQuery } from "@/utils/query-string";
import { toShopQuery, type ShopFilters } from "@/utils/storefront/shop-query";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/**
 * Shop filter state lives in the URL. This provider turns a filter change
 * into `router.replace(?…)` inside a transition; the server page re-renders
 * from the new search params, and `isPending` dims the grid meanwhile.
 */
type ShopNavigationValue = {
  state: { filters: ShopFilters; facets: ProductFacets | null; preset: Partial<ShopFilters>; total: number };
  actions: { apply: (next: Partial<ShopFilters>) => void; hrefFor: (next: Partial<ShopFilters>) => string };
  meta: { isPending: boolean };
};

const ShopNavigationContext = createContext<ShopNavigationValue | null>(null);

type ProviderProps = {
  filters: ShopFilters;
  facets: ProductFacets | null;
  preset: Partial<ShopFilters>;
  total: number;
  children: ReactNode;
};

export function ShopNavigationProvider({ filters, facets, preset, total, children }: ProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const hrefFor = useCallback(
    (next: Partial<ShopFilters>) => withQuery(pathname, toShopQuery({ ...filters, page: 1, ...next }, preset)),
    [filters, pathname, preset],
  );

  const apply = useCallback(
    (next: Partial<ShopFilters>) => startTransition(() => router.replace(hrefFor(next), { scroll: false })),
    [hrefFor, router],
  );

  const value = useMemo<ShopNavigationValue>(
    () => ({ state: { filters, facets, preset, total }, actions: { apply, hrefFor }, meta: { isPending } }),
    [apply, facets, filters, hrefFor, isPending, preset, total],
  );

  return <ShopNavigationContext value={value}>{children}</ShopNavigationContext>;
}

export function useShopNavigation(): ShopNavigationValue {
  const value = use(ShopNavigationContext);
  if (!value) throw new Error(ERROR_MESSAGES.invariant.outsideProvider("useShopNavigation", "ShopNavigationProvider"));
  return value;
}
