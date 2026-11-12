import { addWishlistItem, fetchWishlist, removeWishlistItem } from "@/lib/cart-api";
import { snapshotFromWishlistRow, type ProductSnapshot } from "@/utils/storefront/snapshots";
import { serverWishlistReceived, wishlistAdded, wishlistRemoved } from "./product-lists-slice";
import type { AppThunk } from "./thunk-types";

export function loadServerWishlist(): AppThunk {
  return async (dispatch) => {
    const rows = await fetchWishlist();
    const items = rows.map(snapshotFromWishlistRow).filter((item): item is ProductSnapshot => item !== null);
    dispatch(serverWishlistReceived(items));
  };
}

/** After sign-in: save the guest wishlist to the account, then read the account list. */
export function mergeGuestWishlist(guest: readonly ProductSnapshot[]): AppThunk {
  return async (dispatch) => {
    await Promise.all(guest.map((item) => addWishlistItem(item.id).catch(() => undefined)));
    await dispatch(loadServerWishlist());
  };
}

/** Optimistic toggle; rolls back when the API refuses. Resolves true when the item is now saved. */
export function toggleWishlist(item: ProductSnapshot): AppThunk<Promise<boolean>> {
  return async (dispatch, getState) => {
    const { productLists } = getState();
    const saved = productLists.wishlist.some((entry) => entry.id === item.id);
    dispatch(saved ? wishlistRemoved(item.id) : wishlistAdded(item));
    if (productLists.wishlistSource === "guest") return !saved;
    try {
      if (saved) await removeWishlistItem(item.id);
      else await addWishlistItem(item.id);
      return !saved;
    } catch (error) {
      dispatch(saved ? wishlistAdded(item) : wishlistRemoved(item.id));
      throw error;
    }
  };
}
