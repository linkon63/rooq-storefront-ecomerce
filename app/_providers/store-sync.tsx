"use client";

import { useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storefront";
import { isRecordList, readStored, writeStored } from "@/lib/storefront/local-store";
import { useAppDispatch, useAppStore } from "@/lib/store/hooks";
import { guestCartRestored } from "@/lib/store/slices/cart-slice";
import { listsRestored } from "@/lib/store/slices/product-lists-slice";
import { currencySet } from "@/lib/store/slices/session-slice";
import { restoreSession } from "@/lib/store/slices/session-thunks";
import type { CartLine } from "@/types/storefront/commerce";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

const isCartLines = isRecordList(["id", "variantId", "name"]) as (value: unknown) => value is CartLine[];
const isSnapshots = isRecordList(["id", "slug", "name"]) as (value: unknown) => value is ProductSnapshot[];

/**
 * Mounts once in the storefront layout. Restores the guest bag and product
 * lists from localStorage, checks the session, and writes changes back.
 * Renders nothing.
 */
export function StoreSync({ currency }: { currency: string }) {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  useEffect(() => {
    dispatch(currencySet(currency));
  }, [currency, dispatch]);

  useEffect(() => {
    dispatch(guestCartRestored(readStored(STORAGE_KEYS.cart, isCartLines, [])));
    dispatch(
      listsRestored({
        wishlist: readStored(STORAGE_KEYS.wishlist, isSnapshots, []),
        compare: readStored(STORAGE_KEYS.compare, isSnapshots, []),
        recentlyViewed: readStored(STORAGE_KEYS.recentlyViewed, isSnapshots, []),
      }),
    );
    void dispatch(restoreSession());

    let previous = store.getState();
    return store.subscribe(() => {
      const next = store.getState();
      if (next.cart !== previous.cart && next.cart.hydrated && next.cart.source === "guest") {
        writeStored(STORAGE_KEYS.cart, next.cart.lines);
      }
      const lists = next.productLists;
      if (lists !== previous.productLists && lists.hydrated) {
        if (lists.wishlistSource === "guest") writeStored(STORAGE_KEYS.wishlist, lists.wishlist);
        writeStored(STORAGE_KEYS.compare, lists.compare);
        writeStored(STORAGE_KEYS.recentlyViewed, lists.recentlyViewed);
      }
      previous = next;
    });
  }, [dispatch, store]);

  return null;
}
