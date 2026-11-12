import { clearCustomerToken, getCustomerToken, isUnauthorized, setCustomerToken } from "@/lib/api";
import * as accountApi from "@/lib/storefront-api";
import { signedOutCart } from "./cart-slice";
import { loadServerCart, mergeGuestCart } from "./cart-thunks";
import { signedOutWishlist } from "./product-lists-slice";
import { signedIn, signedOut } from "./session-slice";
import type { AppThunk } from "./thunk-types";
import { loadServerWishlist, mergeGuestWishlist } from "./wishlist-thunks";

/**
 * Session lifecycle. Signing in merges the guest bag and wishlist into the
 * account; signing out clears both (the account copy stays on the server).
 */

function startSession(result: accountApi.AuthResult): AppThunk {
  return async (dispatch, getState) => {
    setCustomerToken(result.accessToken);
    const { cart, productLists } = getState();
    const guestLines = cart.source === "guest" ? cart.lines : [];
    const guestWishlist = productLists.wishlistSource === "guest" ? productLists.wishlist : [];
    dispatch(signedIn(result.user));
    await Promise.allSettled([
      dispatch(mergeGuestCart(guestLines)),
      dispatch(mergeGuestWishlist(guestWishlist)),
    ]);
  };
}

export function signIn(identifier: string, password: string, rememberMe: boolean): AppThunk {
  return async (dispatch) => {
    await dispatch(startSession(await accountApi.login(identifier, password, rememberMe)));
  };
}

export function signUp(input: { name: string; email: string; phone: string; password: string }): AppThunk {
  return async (dispatch) => {
    await dispatch(startSession(await accountApi.register(input)));
  };
}

export function signInWithGoogle(googleAccessToken: string): AppThunk {
  return async (dispatch) => {
    await dispatch(startSession(await accountApi.googleLogin(googleAccessToken)));
  };
}

export function signOut(): AppThunk {
  return async (dispatch) => {
    await accountApi.logout().catch(() => undefined);
    clearCustomerToken();
    dispatch(signedOut());
    dispatch(signedOutCart());
    dispatch(signedOutWishlist());
  };
}

/**
 * On first load: when a token cookie exists, confirm it with GET /auth/me and
 * load the account bag and wishlist; otherwise settle as a guest.
 */
export function restoreSession(): AppThunk {
  return async (dispatch) => {
    if (!getCustomerToken()) {
      dispatch(signedOut());
      return;
    }
    try {
      dispatch(signedIn(await accountApi.getMe()));
    } catch (error) {
      if (isUnauthorized(error)) clearCustomerToken();
      dispatch(signedOut());
      return;
    }
    await Promise.allSettled([dispatch(loadServerCart()), dispatch(loadServerWishlist())]);
  };
}
