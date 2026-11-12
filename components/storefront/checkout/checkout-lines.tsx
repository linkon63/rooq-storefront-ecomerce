"use client";

import Image from "next/image";
import type { CartLine } from "@/types/storefront/commerce";
import { variantCaption } from "@/utils/storefront/orders";
import { Price } from "../shared/price";

/** Read-only line list for checkout review (edits happen in the bag). */
export function CheckoutLines({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="divide-y divide-selvedge border-y border-selvedge">
      {lines.map((line) => (
        <li key={line.id} className="flex items-center gap-3 py-3">
          <span className="relative aspect-[3/4] w-14 shrink-0 overflow-hidden bg-selvedge">
            {line.image ? <Image src={line.image} alt="" fill sizes="56px" className="object-cover" /> : null}
            <span className="absolute -right-0 -top-0 grid size-5 place-items-center rounded-bl bg-ink text-[0.625rem] font-bold text-chalk">
              {line.quantity}
            </span>
          </span>
          <span className="min-w-0 flex-1 text-sm">
            <span className="block truncate font-medium">{line.name}</span>
            <span className="text-stone">{variantCaption(line.colorName, line.sizeLabel)}</span>
            {!line.inStock ? <span className="block text-xs font-semibold text-dye-deep">Sold out: remove it from your bag</span> : null}
          </span>
          <Price price={line.price * line.quantity} className="shrink-0 text-sm" />
        </li>
      ))}
    </ul>
  );
}
