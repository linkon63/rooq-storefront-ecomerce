import { combineSlices } from "@reduxjs/toolkit";
import { uiSlice } from "./slices/ui-slice";
import { cartSlice } from "./slices/cart-slice";
import { productListsSlice } from "./slices/product-lists-slice";
import { sessionSlice } from "./slices/session-slice";
import { adminFiltersSlice } from "./slices/admin-filters-slice";
import { posSlice } from "./slices/pos-slice";

/**
 * Add feature slices here (cart, wishlist, compare, auth, currency,
 * recentlyViewed …). `combineSlices` also supports lazy `inject()` for
 * route-specific slices.
 */
export const rootReducer = combineSlices(uiSlice, cartSlice, productListsSlice, sessionSlice, adminFiltersSlice, posSlice);

export type RootState = ReturnType<typeof rootReducer>;
