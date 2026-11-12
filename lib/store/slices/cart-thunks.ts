import { addCartItem, clearServerCart, fetchCart, removeCartItem, updateCartItem } from "@/lib/cart-api";
import type { CartLine, CartLineInput } from "@/types/storefront/commerce";
import { cartLinesFromServer, clampQuantity } from "@/utils/storefront/cart";
import {
  cartEmptied,
  cartPending,
  guestLineAdded,
  lineQuantitySet,
  lineRemoved,
  serverCartReceived,
} from "./cart-slice";
import type { AppThunk } from "./thunk-types";

/**
 * Bag actions. Guests change the slice directly (persisted by StoreSync);
 * signed-in shoppers go through the API and the slice takes its answer.
 * Errors propagate so the calling hook can show the right toast.
 */

export function loadServerCart(): AppThunk {
  return async (dispatch) => {
    dispatch(serverCartReceived(cartLinesFromServer(await fetchCart())));
  };
}

/** After sign-in: push the guest lines into the account bag, then read it back. */
export function mergeGuestCart(guestLines: readonly CartLine[]): AppThunk {
  return async (dispatch) => {
    for (const line of guestLines) {
      try {
        await addCartItem(line.variantId, line.quantity);
      } catch {
        // A line that is no longer sold is dropped rather than blocking the rest.
      }
    }
    await dispatch(loadServerCart());
  };
}

export function addToBag(input: CartLineInput): AppThunk {
  return async (dispatch, getState) => {
    const { cart } = getState();
    if (cart.source === "guest") {
      dispatch(guestLineAdded(input));
      return;
    }
    dispatch(cartPending(true));
    try {
      const cartResponse = await addCartItem(input.variantId, clampQuantity(input.quantity ?? 1));
      dispatch(serverCartReceived(cartLinesFromServer(cartResponse)));
    } finally {
      dispatch(cartPending(false));
    }
  };
}

export function changeLineQuantity(lineId: string, quantity: number): AppThunk {
  return async (dispatch, getState) => {
    const { cart } = getState();
    const previous = cart.lines.find((line) => line.id === lineId)?.quantity;
    dispatch(lineQuantitySet({ id: lineId, quantity }));
    if (cart.source === "guest") return;
    try {
      dispatch(serverCartReceived(cartLinesFromServer(await updateCartItem(lineId, clampQuantity(quantity)))));
    } catch (error) {
      if (previous !== undefined) dispatch(lineQuantitySet({ id: lineId, quantity: previous }));
      throw error;
    }
  };
}

export function removeFromBag(lineId: string): AppThunk {
  return async (dispatch, getState) => {
    const { cart } = getState();
    if (cart.source === "guest") {
      dispatch(lineRemoved(lineId));
      return;
    }
    dispatch(serverCartReceived(cartLinesFromServer(await removeCartItem(lineId))));
  };
}

/** After an order is placed. A failed server clear is harmless: the order already consumed the lines. */
export function emptyBag(): AppThunk {
  return async (dispatch, getState) => {
    const source = getState().cart.source;
    dispatch(cartEmptied());
    if (source === "server") await clearServerCart().catch(() => undefined);
  };
}
