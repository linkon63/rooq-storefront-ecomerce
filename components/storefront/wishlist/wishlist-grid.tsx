"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import { useAppSelector } from "@/lib/store/hooks";
import { selectListsHydrated } from "@/lib/store/slices/product-lists-slice";
import { EmptyState } from "../shared/empty-state";
import { SnapshotCard } from "./snapshot-card";
import { WishlistItemActions } from "./wishlist-item-actions";

/** Saved pieces; "Choose size" opens quick view because a bag line needs a size. */
export function WishlistGrid() {
  const { items } = useWishlist();
  const hydrated = useAppSelector(selectListsHydrated);
  if (!hydrated) return <div className="h-64 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading wishlist" />;
  if (items.length === 0) {
    return <EmptyState title="Nothing saved yet" body="Tap the heart on any piece to keep it here." action={{ label: "Shop new in", href: "/new" }} />;
  }
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <SnapshotCard item={item} actions={<WishlistItemActions item={item} />} />
        </li>
      ))}
    </ul>
  );
}
