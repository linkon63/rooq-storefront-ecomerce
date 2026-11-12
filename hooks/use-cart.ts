"use client";

import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  selectCartHydrated,
  selectCartLines,
  selectCartPending,
} from "@/lib/store/slices/cart-slice";
import { addToBag, changeLineQuantity, removeFromBag } from "@/lib/store/slices/cart-thunks";
import { setCartDrawerOpen } from "@/lib/store/slices/ui-slice";
import type { CartLineInput } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { summariseCart } from "@/utils/storefront/cart";

/** The bag, its totals and its actions, with toasts. Thin over the cart slice. */
export function useCart() {
  const dispatch = useAppDispatch();
  const lines = useAppSelector(selectCartLines);
  const hydrated = useAppSelector(selectCartHydrated);
  const pending = useAppSelector(selectCartPending);
  const summary = useMemo(() => summariseCart(lines), [lines]);

  const add = useCallback(
    async (input: CartLineInput, options: { openDrawer?: boolean } = { openDrawer: true }) => {
      try {
        await dispatch(addToBag(input));
        toast.success(SUCCESS_MESSAGES.storefront.addedToBag);
        if (options.openDrawer) dispatch(setCartDrawerOpen(true));
        return true;
      } catch (error) {
        toast.error(errorText(error, ERROR_MESSAGES.storefront.addToBagFailed));
        return false;
      }
    },
    [dispatch],
  );

  const setQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      try {
        await dispatch(changeLineQuantity(lineId, quantity));
      } catch (error) {
        toast.error(errorText(error, ERROR_MESSAGES.storefront.bagUpdateFailed));
      }
    },
    [dispatch],
  );

  const remove = useCallback(
    async (lineId: string) => {
      try {
        await dispatch(removeFromBag(lineId));
        toast(SUCCESS_MESSAGES.storefront.removedFromBag);
      } catch (error) {
        toast.error(errorText(error, ERROR_MESSAGES.storefront.bagUpdateFailed));
      }
    },
    [dispatch],
  );

  const openDrawer = useCallback(() => dispatch(setCartDrawerOpen(true)), [dispatch]);

  return { lines, summary, hydrated, pending, add, setQuantity, remove, openDrawer };
}
