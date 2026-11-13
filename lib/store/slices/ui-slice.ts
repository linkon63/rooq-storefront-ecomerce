import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/** Cross-cutting UI chrome state. Feature slices live next to this file. */
export type UiState = {
  isMobileNavOpen: boolean;
  isSearchOpen: boolean;
  isCartDrawerOpen: boolean;
  /** Product id shown in the quick-view modal, or null. */
  quickViewProductId: string | null;
  /** Product id whose size guide is open, or null. */
  sizeGuideProductId: string | null;
  /** The home page's stitched thread has reached the end and points at the WhatsApp button. */
  isWhatsappHighlighted: boolean;
};

export const initialUiState: UiState = {
  isMobileNavOpen: false,
  isSearchOpen: false,
  isCartDrawerOpen: false,
  quickViewProductId: null,
  sizeGuideProductId: null,
  isWhatsappHighlighted: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: initialUiState,
  reducers: {
    setMobileNavOpen(state, action: PayloadAction<boolean>) {
      state.isMobileNavOpen = action.payload;
    },
    setSearchOpen(state, action: PayloadAction<boolean>) {
      state.isSearchOpen = action.payload;
    },
    setCartDrawerOpen(state, action: PayloadAction<boolean>) {
      state.isCartDrawerOpen = action.payload;
    },
    openQuickView(state, action: PayloadAction<string>) {
      state.quickViewProductId = action.payload;
    },
    closeQuickView(state) {
      state.quickViewProductId = null;
    },
    openSizeGuide(state, action: PayloadAction<string>) {
      state.sizeGuideProductId = action.payload;
    },
    closeSizeGuide(state) {
      state.sizeGuideProductId = null;
    },
    setWhatsappHighlighted(state, action: PayloadAction<boolean>) {
      state.isWhatsappHighlighted = action.payload;
    },
    closeAllOverlays() {
      return initialUiState;
    },
  },
  selectors: {
    selectIsMobileNavOpen: (state) => state.isMobileNavOpen,
    selectIsSearchOpen: (state) => state.isSearchOpen,
    selectIsCartDrawerOpen: (state) => state.isCartDrawerOpen,
    selectQuickViewProductId: (state) => state.quickViewProductId,
    selectSizeGuideProductId: (state) => state.sizeGuideProductId,
    selectIsWhatsappHighlighted: (state) => state.isWhatsappHighlighted,
  },
});

export const {
  setMobileNavOpen,
  setSearchOpen,
  setCartDrawerOpen,
  openQuickView,
  closeQuickView,
  openSizeGuide,
  closeSizeGuide,
  setWhatsappHighlighted,
  closeAllOverlays,
} = uiSlice.actions;

export const {
  selectIsMobileNavOpen,
  selectIsSearchOpen,
  selectIsCartDrawerOpen,
  selectQuickViewProductId,
  selectSizeGuideProductId,
  selectIsWhatsappHighlighted,
} = uiSlice.selectors;
