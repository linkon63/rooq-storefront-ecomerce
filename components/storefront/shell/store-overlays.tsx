"use client";

import dynamic from "next/dynamic";
import { useAppSelector } from "@/lib/store/hooks";
import { selectAuthOpen } from "@/lib/store/slices/session-slice";
import {
  selectIsCartDrawerOpen,
  selectIsSearchOpen,
  selectQuickViewProductId,
} from "@/lib/store/slices/ui-slice";
import type { StoreSettings } from "@/types/storefront/content";

/* Each overlay's code loads only the first time it is opened. */
const SearchOverlay = dynamic(() => import("../search/search-overlay").then((m) => m.SearchOverlay), { ssr: false });
const CartDrawer = dynamic(() => import("../cart/cart-drawer").then((m) => m.CartDrawer), { ssr: false });
const AuthSheet = dynamic(() => import("../auth/auth-sheet").then((m) => m.AuthSheet), { ssr: false });
const QuickViewDialog = dynamic(() => import("../quick-view/quick-view-dialog").then((m) => m.QuickViewDialog), {
  ssr: false,
});

export function StoreOverlays({ delivery }: { delivery: StoreSettings["delivery"] }) {
  const searchOpen = useAppSelector(selectIsSearchOpen);
  const cartOpen = useAppSelector(selectIsCartDrawerOpen);
  const authOpen = useAppSelector(selectAuthOpen);
  const quickViewId = useAppSelector(selectQuickViewProductId);

  return (
    <>
      {searchOpen ? <SearchOverlay /> : null}
      {cartOpen ? <CartDrawer delivery={delivery} /> : null}
      {authOpen ? <AuthSheet /> : null}
      {quickViewId ? <QuickViewDialog productId={quickViewId} /> : null}
    </>
  );
}
