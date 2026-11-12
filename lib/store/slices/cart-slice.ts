import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartLine, CartLineInput } from "@/types/storefront/commerce";
import { addGuestLine, clampQuantity } from "@/utils/storefront/cart";

/**
 * The bag. Guests keep it in localStorage; signed-in shoppers' bag lives on
 * the API and this slice mirrors the last response. `source` says which.
 */
export type CartState = {
  lines: CartLine[];
  source: "guest" | "server";
  /** True once the bag has been read from storage or the API. */
  hydrated: boolean;
  pending: boolean;
  couponCode: string | null;
  couponDiscount: number;
};

export const initialCartState: CartState = {
  lines: [],
  source: "guest",
  hydrated: false,
  pending: false,
  couponCode: null,
  couponDiscount: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState: initialCartState,
  reducers: {
    guestCartRestored(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload;
      state.source = "guest";
      state.hydrated = true;
    },
    serverCartReceived(state, action: PayloadAction<CartLine[]>) {
      state.lines = action.payload;
      state.source = "server";
      state.hydrated = true;
      state.pending = false;
    },
    guestLineAdded(state, action: PayloadAction<CartLineInput>) {
      state.lines = addGuestLine(state.lines, action.payload);
    },
    lineQuantitySet(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const line = state.lines.find((entry) => entry.id === action.payload.id);
      if (line) line.quantity = clampQuantity(action.payload.quantity);
    },
    lineRemoved(state, action: PayloadAction<string>) {
      state.lines = state.lines.filter((line) => line.id !== action.payload);
    },
    cartPending(state, action: PayloadAction<boolean>) {
      state.pending = action.payload;
    },
    cartEmptied(state) {
      state.lines = [];
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    signedOutCart(state) {
      state.lines = [];
      state.source = "guest";
      state.couponCode = null;
      state.couponDiscount = 0;
    },
    couponApplied(state, action: PayloadAction<{ code: string; discount: number }>) {
      state.couponCode = action.payload.code;
      state.couponDiscount = action.payload.discount;
    },
    couponRemoved(state) {
      state.couponCode = null;
      state.couponDiscount = 0;
    },
  },
  selectors: {
    selectCartLines: (state) => state.lines,
    selectCartSource: (state) => state.source,
    selectCartHydrated: (state) => state.hydrated,
    selectCartPending: (state) => state.pending,
    selectCartCount: (state) => state.lines.reduce((sum, line) => sum + line.quantity, 0),
    selectCouponCode: (state) => state.couponCode,
    selectCouponDiscount: (state) => state.couponDiscount,
  },
});

export const {
  guestCartRestored,
  serverCartReceived,
  guestLineAdded,
  lineQuantitySet,
  lineRemoved,
  cartPending,
  cartEmptied,
  signedOutCart,
  couponApplied,
  couponRemoved,
} = cartSlice.actions;

export const {
  selectCartLines,
  selectCartSource,
  selectCartHydrated,
  selectCartPending,
  selectCartCount,
  selectCouponCode,
  selectCouponDiscount,
} = cartSlice.selectors;
