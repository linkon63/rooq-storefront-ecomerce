"use client";

/**
 * Debounced product search backed by the storefront `/products?search=` API.
 *
 * cap-1 originally searched through Typesense; this keeps the same hook surface
 * so the search components work unchanged.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchShopProducts } from "@/lib/shop-api";
import { toProductItems } from "@/lib/shop-adapters";
import type { ProductItem } from "@/types/shop";

const DEBOUNCE_MS = 300;
const RESULT_LIMIT = 8;

export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guards against a slow early request overwriting a newer one's results.
  const requestIdRef = useRef(0);

  const search = useCallback((keyword: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const term = keyword.trim();
    if (!term) {
      requestIdRef.current++;
      setSearchResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current;
      try {
        const { data } = await fetchShopProducts({ search: term, limit: RESULT_LIMIT });
        if (requestId !== requestIdRef.current) return;
        setSearchResults(toProductItems(data));
      } catch {
        if (requestId !== requestIdRef.current) return;
        setError("Could not load search results. Please try again.");
        setSearchResults([]);
      } finally {
        if (requestId === requestIdRef.current) setIsLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { searchResults, isLoading, error, search };
}

export default useProductSearch;
