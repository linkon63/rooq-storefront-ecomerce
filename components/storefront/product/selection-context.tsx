"use client";

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from "react";
import type { PositionedImage, ProductColor, ProductDetail, VariantPublic } from "@/types/storefront/catalog";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  findVariant,
  galleryFor,
  initialColorId,
  initialSizeId,
  selectionProblem,
  sizeOptions,
  type SizeOption,
} from "@/utils/storefront/variant-selection";

/**
 * Colour and size selection for one product, shared by the gallery, the
 * pickers and the add-to-bag bar. Only this provider knows how the state is
 * held (state / actions / meta interface).
 */
type SelectionValue = {
  state: { colorId: string | null; sizeId: string | null; attempted: boolean };
  actions: {
    selectColor: (colorId: string) => void;
    selectSize: (sizeId: string) => void;
    /** Marks a failed add-to-bag so the pickers can show their prompt. */
    flagAttempt: () => void;
  };
  meta: {
    product: ProductDetail;
    color: ProductColor | null;
    variant: VariantPublic | null;
    sizes: SizeOption[];
    gallery: PositionedImage[];
    problem: ReturnType<typeof selectionProblem>;
  };
};

const SelectionContext = createContext<SelectionValue | null>(null);

export function ProductSelectionProvider({ product, children }: { product: ProductDetail; children: ReactNode }) {
  const [colorId, setColorId] = useState<string | null>(() => initialColorId(product));
  const [sizeId, setSizeId] = useState<string | null>(() => initialSizeId(product.sizes));
  const [attempted, setAttempted] = useState(false);

  const selectColor = useCallback((next: string) => setColorId(next), []);
  const selectSize = useCallback((next: string) => {
    setSizeId(next);
    setAttempted(false);
  }, []);
  const flagAttempt = useCallback(() => setAttempted(true), []);

  const value = useMemo<SelectionValue>(() => {
    const variant = findVariant(product.variants, colorId, sizeId);
    return {
      state: { colorId, sizeId, attempted },
      actions: { selectColor, selectSize, flagAttempt },
      meta: {
        product,
        color: product.colors.find((entry) => entry.id === colorId) ?? null,
        variant,
        sizes: sizeOptions(product, colorId),
        gallery: galleryFor(product, colorId),
        problem: selectionProblem(product, colorId, sizeId, variant),
      },
    };
  }, [attempted, colorId, flagAttempt, product, selectColor, selectSize, sizeId]);

  return <SelectionContext value={value}>{children}</SelectionContext>;
}

export function useProductSelection(): SelectionValue {
  const value = use(SelectionContext);
  if (!value) throw new Error(ERROR_MESSAGES.invariant.outsideProvider("useProductSelection", "ProductSelectionProvider"));
  return value;
}
