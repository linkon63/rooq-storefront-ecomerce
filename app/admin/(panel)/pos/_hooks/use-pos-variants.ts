"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/admin/http";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { VariantAdmin } from "@/utils/mappers/variant";

/** Active size/colour variants of one product (staff view: stock + colour + size). */
export function usePosVariants(productId: string | null) {
  const [variants, setVariants] = useState<VariantAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    setIsLoading(true);
    setError("");
    apiRequest<VariantAdmin[]>(`/products/${productId}/variants`)
      .then((rows) => {
        if (!cancelled) setVariants(rows.filter((variant) => variant.isActive));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error && err.message ? err.message : ERROR_MESSAGES.pos.productsLoadFailed);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { variants, isLoading, error };
}
