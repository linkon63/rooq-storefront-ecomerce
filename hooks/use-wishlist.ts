"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectIsWishlisted, selectWishlist } from "@/lib/store/slices/product-lists-slice";
import { toggleWishlist } from "@/lib/store/slices/wishlist-thunks";
import { errorText } from "@/utils/api-error";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

export function useWishlist() {
  const items = useAppSelector(selectWishlist);
  return { items };
}

/** One heart button's state and toggle. Subscribes to a boolean only. */
export function useWishlistToggle(productId: string) {
  const dispatch = useAppDispatch();
  const saved = useAppSelector((state) => selectIsWishlisted(state, productId));

  const toggle = useCallback(
    async (snapshot: ProductSnapshot) => {
      try {
        const nowSaved = await dispatch(toggleWishlist(snapshot));
        toast(nowSaved ? SUCCESS_MESSAGES.storefront.addedToWishlist : SUCCESS_MESSAGES.storefront.removedFromWishlist);
      } catch (error) {
        toast.error(errorText(error, ERROR_MESSAGES.storefront.wishlistFailed));
      }
    },
    [dispatch],
  );

  return { saved, toggle };
}
