"use client";

import { useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { listProducts } from "@/lib/shop-api";
import type { PaginationMeta, ProductCard } from "@/types/storefront/catalog";
import type { QueryParams } from "@/utils/query-string";

type Loaded = { products: ProductCard[]; page: number };

/** Pages already appended, per listing, so going back lands on the same list. */
const cache = new Map<string, Loaded>();

/** "Load more" over the server-rendered first page. Remount (key) when the query changes. */
export function useMoreProducts(query: QueryParams, meta: PaginationMeta) {
  const key = JSON.stringify(query);
  const [loaded, setLoaded] = useState<Loaded>(() => cache.get(key) ?? { products: [], page: meta.page });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasMore = loaded.page < meta.totalPages;

  async function loadMore() {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const page = loaded.page + 1;
      const list = await listProducts({ ...query, page, facets: false });
      const next = { products: [...loaded.products, ...list.data], page };
      cache.set(key, next);
      setLoaded(next);
    } catch {
      setError(ERROR_MESSAGES.storefront.productsLoadFailed);
    } finally {
      setLoading(false);
    }
  }

  return { products: loaded.products, hasMore, loading, error, loadMore };
}
