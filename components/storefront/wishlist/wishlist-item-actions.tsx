"use client";

import { useWishlistToggle } from "@/hooks/use-wishlist";
import { useAppDispatch } from "@/lib/store/hooks";
import { openQuickView } from "@/lib/store/slices/ui-slice";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

export function WishlistItemActions({ item }: { item: ProductSnapshot }) {
  const dispatch = useAppDispatch();
  const { toggle } = useWishlistToggle(item.id);
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => dispatch(openQuickView(item.id))}
        className="h-10 rounded bg-ink px-4 text-sm font-semibold text-chalk hover:bg-ink-soft"
      >
        Choose size
      </button>
      <button type="button" onClick={() => void toggle(item)} className="h-10 px-2 text-sm underline underline-offset-4">
        Remove
      </button>
    </div>
  );
}
