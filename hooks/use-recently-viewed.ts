"use client";

import { useEffect, useMemo, useState } from "react";
import { listProducts } from "@/lib/shop-api";
import { useAppSelector } from "@/lib/store/hooks";
import { selectListsHydrated, selectRecentlyViewed } from "@/lib/store/slices/product-lists-slice";
import type { ProductCard } from "@/types/storefront/catalog";

type RecentlyViewed = { cards: ProductCard[]; isLoading: boolean };

/**
 * Recently viewed, live: the ids come from the stored list (newest first),
 * the cards from the API, so price, stock, sale and images are always
 * current and products taken off sale or deleted drop out.
 */
export function useRecentlyViewed(excludeId?: string): RecentlyViewed {
  const hydrated = useAppSelector(selectListsHydrated);
  const viewed = useAppSelector(selectRecentlyViewed);
  const ids = useMemo(() => viewed.map((item) => item.id).filter((id) => id !== excludeId), [viewed, excludeId]);
  const key = ids.join(",");
  const [state, setState] = useState<{ key: string; cards: ProductCard[] }>({ key: "", cards: [] });

  useEffect(() => {
    if (!hydrated || !key) return;
    const controller = new AbortController();
    const wanted = key.split(",");
    listProducts({ ids: wanted, limit: wanted.length, facets: false }, controller.signal)
      .then((list) => {
        const byId = new Map(list.data.map((card) => [card.id, card]));
        setState({ key, cards: wanted.flatMap((id) => byId.get(id) ?? []) });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, cards: [] });
      });
    return () => controller.abort();
  }, [hydrated, key]);

  if (!key) return { cards: [], isLoading: false };
  return { cards: state.key === key ? state.cards : [], isLoading: state.key !== key };
}
