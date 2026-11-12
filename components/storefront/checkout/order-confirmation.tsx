"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMoney } from "@/hooks/use-money";
import { useSession } from "@/hooks/use-session";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { readLastOrder } from "@/lib/storefront/last-order";
import type { Order } from "@/types/storefront/commerce";
import { variantCaption } from "@/utils/storefront/orders";

/** Thank-you page: the order number, what was ordered and where it is going. */
export function OrderConfirmation() {
  const orderNumber = useSearchParams().get("order");
  const { isSignedIn } = useSession();
  const format = useMoney();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => setOrder(readLastOrder(orderNumber)), [orderNumber]);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="font-display font-expanded text-[clamp(2.25rem,8vw,4rem)] font-extrabold leading-[0.95]">Thank you.</h1>
        <p className="text-lg">{SUCCESS_MESSAGES.storefront.orderPlaced}</p>
        {orderNumber ? (
          <p className="text-stone">
            Order number <strong className="text-ink">{orderNumber}</strong>
          </p>
        ) : null}
      </div>
      {order ? (
        <section aria-labelledby="confirm-items" className="flex flex-col gap-4">
          <h2 id="confirm-items" className="font-wide text-lg font-bold">
            What you ordered
          </h2>
          <ul className="divide-y divide-selvedge border-y border-selvedge">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
                <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-selvedge">
                  {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : null}
                </span>
                <span className="flex-1">
                  <span className="block font-medium">
                    {item.productName} × {item.quantity}
                  </span>
                  <span className="text-stone">{variantCaption(item.colorName, item.sizeLabel)}</span>
                </span>
                <span className="tabular-nums">{format(item.totalPrice)}</span>
              </li>
            ))}
          </ul>
          <p className="flex justify-between font-semibold">
            <span>Total, cash on delivery</span>
            <span className="tabular-nums">{format(order.total)}</span>
          </p>
          {order.shippingAddress ? (
            <p className="text-sm text-stone">
              Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1}, {order.shippingAddress.city}.
            </p>
          ) : null}
        </section>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {isSignedIn ? (
          <Link href="/profile?tab=orders" className="inline-flex h-12 items-center rounded bg-ink px-6 text-sm font-semibold text-chalk">
            Track your order
          </Link>
        ) : null}
        <Link href="/new" className="inline-flex h-12 items-center rounded border border-ink px-6 text-sm font-semibold">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
