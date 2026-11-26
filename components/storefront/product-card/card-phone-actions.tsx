"use client";

import { FiPlus } from "react-icons/fi";
import { useAppDispatch } from "@/lib/store/hooks";
import { openQuickView } from "@/lib/store/slices/ui-slice";
import type { ProductCard } from "@/types/storefront/catalog";
import { snapshotFromCard } from "@/utils/storefront/snapshots";
import { WishlistButton } from "./wishlist-button";

/** Phone card actions: heart on top, "+" opens the colour and size sheet. */
export function CardPhoneActions({ product }: { product: ProductCard }) {
  const dispatch = useAppDispatch();
  return (
    <div className="md:hidden">
      <div className="absolute right-1 top-1 z-10 rounded-full bg-paper/85 [&>button]:size-11">
        <WishlistButton productId={product.id} snapshot={snapshotFromCard(product)} />
      </div>
      <button
        type="button"
        disabled={!product.inStock}
        onClick={() => dispatch(openQuickView(product.id))}
        aria-label={product.inStock ? `Choose size and add ${product.name}` : `${product.name} is sold out`}
        className="press absolute bottom-1.5 right-1.5 z-10 grid size-11 place-items-center rounded-full bg-ink text-chalk shadow-sheet disabled:opacity-45"
      >
        <FiPlus aria-hidden className="size-5" />
      </button>
    </div>
  );
}
