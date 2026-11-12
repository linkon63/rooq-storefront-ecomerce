"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { CART_MAX_QUANTITY } from "@/lib/constants/storefront";
import type { CartLine } from "@/types/storefront/commerce";
import { isLightColor } from "@/utils/color";
import { Price } from "../shared/price";
import { QuantityStepper } from "./quantity-stepper";

/** One bag line: image, name, colour and size, quantity and remove. */
export function CartLineItem({ line, onNavigate }: { line: CartLine; onNavigate?: () => void }) {
  const { setQuantity, remove, pending } = useCart();
  const max = line.lowStockCount ? Math.min(line.lowStockCount, CART_MAX_QUANTITY) : CART_MAX_QUANTITY;
  return (
    <li className="flex gap-3 py-4">
      <Link href={`/product/${line.slug}`} onClick={onNavigate} className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-selvedge sm:w-24">
        {line.image ? <Image src={line.image} alt={line.name} fill sizes="96px" className="object-cover" /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/product/${line.slug}`} onClick={onNavigate} className="text-sm font-medium leading-snug hover:underline">
            {line.name}
          </Link>
          <Price price={line.price * line.quantity} compareAtPrice={line.compareAtPrice ? line.compareAtPrice * line.quantity : null} className="shrink-0 text-sm" />
        </div>
        <p className="flex items-center gap-1.5 text-xs text-stone">
          {line.colorHex ? (
            <span aria-hidden className={`size-2.5 rounded-full ${isLightColor(line.colorHex) ? "ring-1 ring-line" : ""}`} style={{ backgroundColor: line.colorHex }} />
          ) : null}
          {[line.colorName, line.sizeLabel ? `Size ${line.sizeLabel}` : null].filter(Boolean).join(", ")}
        </p>
        {!line.inStock ? <p className="text-xs font-semibold text-dye-deep">Sold out: remove to check out</p> : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantityStepper
            value={line.quantity}
            max={max}
            disabled={pending}
            label={`Quantity of ${line.name}`}
            onChange={(quantity) => void setQuantity(line.id, quantity)}
          />
          <button type="button" onClick={() => void remove(line.id)} className="text-xs font-medium underline underline-offset-4 hover:text-dye-deep">
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
