"use client";

import { useCart } from "@/hooks/use-cart";
import type { StoreSettings } from "@/types/storefront/content";
import { EmptyState } from "../shared/empty-state";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { FreeShippingNote } from "./free-shipping-note";

export function CartPageView({ delivery }: { delivery: StoreSettings["delivery"] }) {
  const { lines, summary, hydrated } = useCart();

  if (!hydrated) {
    return <div className="h-64 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading your bag" />;
  }
  if (lines.length === 0) {
    return <EmptyState title="Your bag is empty" body="Pieces you add will wait here." action={{ label: "Shop new in", href: "/new" }} />;
  }

  const blocked = lines.some((line) => !line.inStock);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="flex flex-col gap-4">
        <FreeShippingNote subtotal={summary.subtotal} threshold={delivery.freeShippingThreshold} />
        <ul className="divide-y divide-selvedge border-y border-selvedge">
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} />
          ))}
        </ul>
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <CartSummary summary={summary} total={summary.subtotal} checkoutHref="/checkout" blocked={blocked}>
          <p className="text-xs text-stone">Delivery and coupons are added at checkout. Pay cash on delivery.</p>
        </CartSummary>
      </div>
    </div>
  );
}
