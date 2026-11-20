"use client";

import { useRef } from "react";
import gsap from "gsap";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { useWishlistToggle } from "@/hooks/use-wishlist";
import { triggerWishlistFly } from "@/lib/storefront/wishlist-fly";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";

type WishlistButtonProps = {
  productId: string;
  snapshot: ProductSnapshot;
  variant?: "icon" | "labelled";
};

export function WishlistButton({ productId, snapshot, variant = "icon" }: WishlistButtonProps) {
  const { saved, toggle } = useWishlistToggle(productId);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const label = saved ? `Remove ${snapshot.name} from wishlist` : `Save ${snapshot.name} to wishlist`;
  const Icon = saved ? FaHeart : FaRegHeart;

  const handleClick = () => {
    if (!saved) {
      if (iconRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          iconRef.current,
          { scale: 0.7 },
          { scale: 1, duration: 0.38, ease: "back.out(3)", clearProps: "transform" },
        );
      }
      triggerWishlistFly(buttonRef.current);
    }
    void toggle(snapshot);
  };

  if (variant === "labelled") {
    return (
      <button
        ref={buttonRef}
        type="button"
        aria-pressed={saved}
        onClick={handleClick}
        className="inline-flex h-12 items-center justify-center gap-2 rounded border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-chalk"
      >
        <span ref={iconRef} className="inline-flex">
          <Icon aria-hidden className={`size-4 ${saved ? "text-dye-deep" : ""}`} />
        </span>
        {saved ? "Saved" : "Save"}
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={saved}
      aria-label={label}
      onClick={handleClick}
      className="grid size-10 place-items-center rounded-full text-ink hover:bg-paper/80"
    >
      <span ref={iconRef} className="inline-flex">
        <Icon aria-hidden className={`size-[18px] ${saved ? "text-dye-deep" : ""}`} />
      </span>
    </button>
  );
}
