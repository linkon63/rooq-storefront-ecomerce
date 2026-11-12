"use client";

import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useWishlistToggle } from "@/hooks/use-wishlist";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

type WishlistButtonProps = {
  productId: string;
  snapshot: ProductSnapshot;
  variant?: "icon" | "labelled";
};

export function WishlistButton({ productId, snapshot, variant = "icon" }: WishlistButtonProps) {
  const { saved, toggle } = useWishlistToggle(productId);
  const label = saved ? `Remove ${snapshot.name} from wishlist` : `Save ${snapshot.name} to wishlist`;
  const Icon = saved ? FaHeart : FaRegHeart;

  if (variant === "labelled") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => void toggle(snapshot)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-chalk"
      >
        <Icon aria-hidden className={`size-4 ${saved ? "text-dye-deep" : ""}`} />
        {saved ? "Saved" : "Save"}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      onClick={() => void toggle(snapshot)}
      className="grid size-10 place-items-center rounded-full text-ink hover:bg-paper/80"
    >
      <Icon aria-hidden className={`size-[18px] ${saved ? "text-dye-deep" : ""}`} />
    </button>
  );
}
