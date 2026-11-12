"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useMoney } from "@/hooks/use-money";
import { useAppDispatch } from "@/lib/store/hooks";
import { setCartDrawerOpen } from "@/lib/store/slices/ui-slice";
import type { StoreSettings } from "@/types/storefront/content";
import { Modal } from "../shared/modal";
import { CartLineItem } from "./cart-line-item";
import { FreeShippingNote } from "./free-shipping-note";

/** Mini bag: opens after "Add to bag" so the shopper can keep browsing or check out. */
export function CartDrawer({ delivery }: { delivery: StoreSettings["delivery"] }) {
  const dispatch = useAppDispatch();
  const { lines, summary } = useCart();
  const format = useMoney();
  const close = () => dispatch(setCartDrawerOpen(false));
  const blocked = lines.some((line) => !line.inStock);

  return (
    <Modal open onOpenChange={(open) => (open ? null : close())} title={`Your bag (${summary.count})`} placement="right">
      {lines.length === 0 ? (
        <div className="flex flex-col items-start gap-4 px-4 py-10">
          <p className="text-stone">Your bag is empty.</p>
          <Link href="/new" onClick={close} className="inline-flex h-11 items-center rounded bg-ink px-5 text-sm font-semibold text-chalk">
            Shop new in
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="border-b border-selvedge px-4 py-3">
            <FreeShippingNote subtotal={summary.subtotal} threshold={delivery.freeShippingThreshold} />
          </div>
          <ul className="flex-1 divide-y divide-selvedge overflow-y-auto px-4">
            {lines.map((line) => (
              <CartLineItem key={line.id} line={line} onNavigate={close} />
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-selvedge px-4 py-4">
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Subtotal</span>
              <span className="font-semibold tabular-nums">{format(summary.subtotal)}</span>
            </div>
            {summary.savings > 0 ? <p className="text-sm text-dye-deep">You save {format(summary.savings)}</p> : null}
            <p className="text-xs text-stone">Delivery and any coupon are worked out at checkout.</p>
            <Link
              href="/checkout"
              onClick={close}
              aria-disabled={blocked}
              className={`inline-flex h-12 items-center justify-center rounded text-sm font-semibold ${
                blocked ? "pointer-events-none bg-selvedge text-stone" : "bg-ink text-chalk hover:bg-ink-soft"
              }`}
            >
              Check out
            </Link>
            <Link href="/cart" onClick={close} className="inline-flex h-11 items-center justify-center rounded border border-ink text-sm font-semibold">
              View bag
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
