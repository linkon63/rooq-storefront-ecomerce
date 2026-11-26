"use client";

import { FiShare2 } from "react-icons/fi";
import { shareLink } from "@/lib/storefront/share";
import type { ProductDetail } from "@/types/storefront/catalog";
import { snapshotFromDetail } from "@/utils/storefront/snapshots";
import { galleryFor } from "@/utils/storefront/variant-selection";
import { WishlistButton } from "../product-card/wishlist-button";

/** Phones: save and share float over the photos. */
export function GalleryActions({ product }: { product: ProductDetail }) {
  const snapshot = snapshotFromDetail(product, galleryFor(product, null)[0]?.url ?? null);
  return (
    <div className="absolute right-0 top-2 flex flex-col gap-2 md:hidden">
      <div className="rounded-full bg-paper/90 shadow-sheet [&>button]:size-11">
        <WishlistButton productId={product.id} snapshot={snapshot} />
      </div>
      <button type="button" aria-label={`Share ${product.name}`} onClick={() => void shareLink(product.name)} className="press grid size-11 place-items-center rounded-full bg-paper/90 shadow-sheet">
        <FiShare2 aria-hidden className="size-[18px]" />
      </button>
    </div>
  );
}
