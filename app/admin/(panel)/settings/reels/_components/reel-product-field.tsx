"use client";

import { useState } from "react";
import type { AdminReel } from "@/types/admin/reel";
import { ProductLinkField } from "../../hero-slider/_components/product-link-field";

type Props = { reel: AdminReel; busy: boolean; onUpdate: (patch: { productId: string }) => void };

/** The linked product; "Unlink" opens the search and the old link stays until another is picked. */
export function ReelProductField({ reel, busy, onUpdate }: Props) {
  const [changing, setChanging] = useState(false);
  return (
    <ProductLinkField
      disabled={busy}
      value={changing ? null : { id: reel.product.id, name: reel.product.name }}
      onChange={(product) => {
        setChanging(!product);
        if (product) onUpdate({ productId: product.id });
      }}
    />
  );
}
