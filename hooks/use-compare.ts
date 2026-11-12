"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { COMPARE_MAX_ITEMS } from "@/lib/constants/storefront";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  compareCleared,
  compareToggled,
  selectCompare,
  selectCompareCount,
  selectIsCompared,
} from "@/lib/store/slices/product-lists-slice";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

export function useCompareList() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCompare);
  const remove = useCallback((item: ProductSnapshot) => dispatch(compareToggled(item)), [dispatch]);
  const clear = useCallback(() => dispatch(compareCleared()), [dispatch]);
  return { items, remove, clear };
}

export function useCompareToggle(productId: string) {
  const dispatch = useAppDispatch();
  const compared = useAppSelector((state) => selectIsCompared(state, productId));
  const count = useAppSelector(selectCompareCount);

  const toggle = useCallback(
    (snapshot: ProductSnapshot) => {
      if (!compared && count >= COMPARE_MAX_ITEMS) {
        toast.error(ERROR_MESSAGES.storefront.compareFull(COMPARE_MAX_ITEMS));
        return;
      }
      dispatch(compareToggled(snapshot));
    },
    [compared, count, dispatch],
  );

  return { compared, toggle };
}
