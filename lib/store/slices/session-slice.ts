import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORE_CURRENCY } from "@/lib/constants/store";
import type { Shopper } from "@/types/storefront/content";
import { currencySymbol } from "@/utils/storefront/money";

export type AuthView = "login" | "register" | "forgot";

/**
 * Who is shopping, the sign-in sheet, and the store currency (from Settings).
 * `status` starts "unknown" until the session check finishes, so the header
 * does not flash a signed-out state for a signed-in shopper.
 */
export type SessionState = {
  user: Shopper | null;
  status: "unknown" | "guest" | "signedIn";
  authOpen: boolean;
  authView: AuthView;
  currency: string;
};

export const initialSessionState: SessionState = {
  user: null,
  status: "unknown",
  authOpen: false,
  authView: "login",
  currency: STORE_CURRENCY,
};

export const sessionSlice = createSlice({
  name: "session",
  initialState: initialSessionState,
  reducers: {
    signedIn(state, action: PayloadAction<Shopper>) {
      state.user = action.payload;
      state.status = "signedIn";
      state.authOpen = false;
    },
    signedOut(state) {
      state.user = null;
      state.status = "guest";
    },
    shopperUpdated(state, action: PayloadAction<Shopper>) {
      state.user = action.payload;
    },
    authOpened(state, action: PayloadAction<AuthView | undefined>) {
      state.authOpen = true;
      state.authView = action.payload ?? "login";
    },
    authViewChanged(state, action: PayloadAction<AuthView>) {
      state.authView = action.payload;
    },
    authClosed(state) {
      state.authOpen = false;
    },
    currencySet(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
  },
  selectors: {
    selectShopper: (state) => state.user,
    selectSessionStatus: (state) => state.status,
    selectIsSignedIn: (state) => state.status === "signedIn",
    selectAuthOpen: (state) => state.authOpen,
    selectAuthView: (state) => state.authView,
    selectCurrency: (state) => state.currency,
    selectCurrencySymbol: (state) => currencySymbol(state.currency),
  },
});

export const { signedIn, signedOut, shopperUpdated, authOpened, authViewChanged, authClosed, currencySet } =
  sessionSlice.actions;

export const {
  selectShopper,
  selectSessionStatus,
  selectIsSignedIn,
  selectAuthOpen,
  selectAuthView,
  selectCurrency,
  selectCurrencySymbol,
} = sessionSlice.selectors;
