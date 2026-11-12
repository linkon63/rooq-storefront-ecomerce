"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { ProductSnapshot } from "@/utils/storefront/snapshots";
import { LabelTag } from "../shared/label-tag";
import { Price } from "../shared/price";

/** Card for a stored product snapshot (wishlist, compare). `actions` sit under the price. */
export function SnapshotCard({ item, actions }: { item: ProductSnapshot; actions?: ReactNode }) {
  return (
    <article className="flex flex-col gap-2">
      <Link href={`/product/${item.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-selvedge">
        {item.image ? <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 22vw, 48vw" className="object-cover" /> : null}
        {!item.inStock ? (
          <span className="absolute left-2 top-2">
            <LabelTag tone="paper">Sold out</LabelTag>
          </span>
        ) : null}
      </Link>
      {item.brand ? <p className="text-xs text-stone">{item.brand}</p> : null}
      <Link href={`/product/${item.slug}`} className="text-[0.9375rem] font-medium leading-snug hover:underline">
        {item.name}
      </Link>
      <Price price={item.price} compareAtPrice={item.compareAtPrice} className="text-[0.9375rem]" />
      {actions}
    </article>
  );
}
