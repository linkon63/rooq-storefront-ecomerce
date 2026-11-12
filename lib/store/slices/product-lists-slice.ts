import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { COMPARE_MAX_ITEMS, RECENTLY_VIEWED_MAX } from "@/lib/constants/storefront";
import { pushRecent, type ProductSnapshot } from "@/utils/storefront/snapshots";

/**
 * Wishlist, compare and recently viewed: three lists of product snapshots.
 * Wishlist syncs to the API when signed in; compare and recently viewed are
 * client-only (fashion-api-contract.md) and persist to localStorage.
 */
export type ProductListsState = {
  wishlist: ProductSnapshot[];
  wishlistSource: "guest" | "server";
  compare: ProductSnapshot[];
  recentlyViewed: ProductSnapshot[];
  hydrated: boolean;
};

export const initialProductListsState: ProductListsState = {
  wishlist: [],
  wishlistSource: "guest",
  compare: [],
  recentlyViewed: [],
  hydrated: false,
};

export const productListsSlice = createSlice({
  name: "productLists",
  initialState: initialProductListsState,
  reducers: {
    listsRestored(
      state,
      action: PayloadAction<{ wishlist: ProductSnapshot[]; compare: ProductSnapshot[]; recentlyViewed: ProductSnapshot[] }>,
    ) {
      state.wishlist = action.payload.wishlist;
      state.compare = action.payload.compare.slice(0, COMPARE_MAX_ITEMS);
      state.recentlyViewed = action.payload.recentlyViewed.slice(0, RECENTLY_VIEWED_MAX);
      state.hydrated = true;
    },
    serverWishlistReceived(state, action: PayloadAction<ProductSnapshot[]>) {
      state.wishlist = action.payload;
      state.wishlistSource = "server";
    },
    wishlistAdded(state, action: PayloadAction<ProductSnapshot>) {
      if (!state.wishlist.some((item) => item.id === action.payload.id)) state.wishlist.unshift(action.payload);
    },
    wishlistRemoved(state, action: PayloadAction<string>) {
      state.wishlist = state.wishlist.filter((item) => item.id !== action.payload);
    },
    signedOutWishlist(state) {
      state.wishlist = [];
      state.wishlistSource = "guest";
    },
    compareToggled(state, action: PayloadAction<ProductSnapshot>) {
      const exists = state.compare.some((item) => item.id === action.payload.id);
      if (exists) state.compare = state.compare.filter((item) => item.id !== action.payload.id);
      else if (state.compare.length < COMPARE_MAX_ITEMS) state.compare.push(action.payload);
    },
    compareCleared(state) {
      state.compare = [];
    },
    productViewed(state, action: PayloadAction<ProductSnapshot>) {
      state.recentlyViewed = pushRecent(state.recentlyViewed, action.payload, RECENTLY_VIEWED_MAX);
    },
  },
  selectors: {
    selectWishlist: (state) => state.wishlist,
    selectWishlistSource: (state) => state.wishlistSource,
    selectCompare: (state) => state.compare,
    selectRecentlyViewed: (state) => state.recentlyViewed,
    selectListsHydrated: (state) => state.hydrated,
    selectWishlistCount: (state) => state.wishlist.length,
    selectCompareCount: (state) => state.compare.length,
    selectIsWishlisted: (state, productId: string) => state.wishlist.some((item) => item.id === productId),
    selectIsCompared: (state, productId: string) => state.compare.some((item) => item.id === productId),
  },
});

export const {
  listsRestored,
  serverWishlistReceived,
  wishlistAdded,
  wishlistRemoved,
  signedOutWishlist,
  compareToggled,
  compareCleared,
  productViewed,
} = productListsSlice.actions;

export const {
  selectWishlist,
  selectWishlistSource,
  selectCompare,
  selectRecentlyViewed,
  selectListsHydrated,
  selectWishlistCount,
  selectCompareCount,
  selectIsWishlisted,
  selectIsCompared,
} = productListsSlice.selectors;
