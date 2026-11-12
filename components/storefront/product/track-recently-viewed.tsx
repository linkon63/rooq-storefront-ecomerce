"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { productViewed, selectListsHydrated } from "@/lib/store/slices/product-lists-slice";
import type { ProductDetail } from "@/types/storefront/catalog";
import { snapshotFromDetail } from "@/utils/storefront/snapshots";
import { galleryFor, initialColorId } from "@/utils/storefront/variant-selection";

/** Records this product in "Recently viewed" once the stored list has loaded. */
export function TrackRecentlyViewed({ product }: { product: ProductDetail }) {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector(selectListsHydrated);

  useEffect(() => {
    if (!hydrated) return;
    const image = galleryFor(product, initialColorId(product))[0]?.url ?? null;
    dispatch(productViewed(snapshotFromDetail(product, image)));
  }, [dispatch, hydrated, product]);

  return null;
}
