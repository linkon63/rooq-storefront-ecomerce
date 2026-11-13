"use client";

import { FiEye } from "react-icons/fi";
import { useAppDispatch } from "@/lib/store/hooks";
import { openQuickView } from "@/lib/store/slices/ui-slice";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";
import { WishlistButton } from "./wishlist-button";

/** Wishlist heart (top right) and quick view (bottom right) over a card image. */
export function CardActions({ productId, snapshot }: { productId: string; snapshot: ProductSnapshot }) {
  const dispatch = useAppDispatch();
  return (
    <>
      <div className="absolute right-1.5 top-1.5">
        <WishlistButton productId={productId} snapshot={snapshot} />
      </div>
      <button
        type="button"
        onClick={() => dispatch(openQuickView(productId))}
        className="type-meta absolute right-2 top-12 inline-flex h-9 items-center gap-1.5 bg-paper/95 px-3 text-ink transition-opacity duration-300 hover:bg-paper [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100"
        aria-label={`Quick view: ${snapshot.name}`}
      >
        <FiEye aria-hidden className="size-4" />
        <span className="hidden sm:inline">Quick view</span>
      </button>
    </>
  );
}
