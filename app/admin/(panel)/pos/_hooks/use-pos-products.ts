"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { ProductCard } from "@/utils/mappers/product-card";

const RESULT_LIMIT = 12;
const DEBOUNCE_MS = 300;

/** Shop products for the till, searched by name / style code / SKU (in-stock first). */
export function usePosProducts(search: string) {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ limit: String(RESULT_LIMIT), facets: "false", inStock: "true" });
        if (search.trim()) params.set("search", search.trim());
        const res = await apiRequest<{ data: ProductCard[] }>(`/products?${params.toString()}`);
        if (!cancelled) setProducts(res.data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error && err.message ? err.message : ERROR_MESSAGES.pos.productsLoadFailed);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, search ? DEBOUNCE_MS : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  return { products, isLoading, error };
}
