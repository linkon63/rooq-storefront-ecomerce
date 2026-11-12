"use client";

import { useEffect, useState } from "react";
import { displayPrice } from "@/utils/storefront/variant-selection";
import { Price } from "../shared/price";
import { AddToBag } from "./add-to-bag";
import { useProductSelection } from "./selection-context";

/** Phone-only bottom bar that appears once the main "Add to bag" has scrolled above the viewport. */
export function StickyBagBar({ anchorId, image }: { anchorId: string; image: string | null }) {
  const { meta } = useProductSelection();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = document.getElementById(anchorId);
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [anchorId]);

  const { price, compareAtPrice } = displayPrice(meta.product, meta.variant);

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-selvedge bg-paper/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{meta.product.name}</p>
        <Price price={price} compareAtPrice={compareAtPrice} className="text-sm" />
      </div>
      <AddToBag image={image} className="w-44 shrink-0" />
    </div>
  );
}
