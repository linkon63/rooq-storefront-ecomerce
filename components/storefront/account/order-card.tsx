"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useMoney } from "@/hooks/use-money";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ORDER_STATUS_LABELS } from "@/lib/constants/storefront";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { cancelOrder } from "@/lib/storefront/orders-api";
import type { Order } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { canCancel, formatOrderDate, variantCaption } from "@/utils/storefront/orders";
import { LabelTag } from "../shared/label-tag";

type Props = { order: Order; onChanged: () => void; onReturn: () => void };

export function OrderCard({ order, onChanged, onReturn }: Props) {
  const format = useMoney();
  const [busy, setBusy] = useState(false);

  async function cancel() {
    setBusy(true);
    try {
      await cancelOrder(order.id);
      toast.success(SUCCESS_MESSAGES.storefront.orderCancelled);
      onChanged();
    } catch (caught) {
      toast.error(errorText(caught, ERROR_MESSAGES.storefront.orderCancelFailed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="rounded bg-paper p-4 md:p-5">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-selvedge pb-3">
        <div>
          <h3 className="font-semibold">Order {order.orderNumber}</h3>
          <p className="text-sm text-stone">Placed {formatOrderDate(order.placedAt)}</p>
        </div>
        <LabelTag tone={order.status === "delivered" ? "ink" : order.status === "cancelled" ? "paper" : "dye"}>
          {ORDER_STATUS_LABELS[order.status]}
        </LabelTag>
      </header>
      <ul className="divide-y divide-selvedge">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3 text-sm">
            <span className="relative aspect-[3/4] w-12 shrink-0 overflow-hidden bg-selvedge">
              {item.image ? <Image src={item.image} alt="" fill sizes="48px" className="object-cover" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              {item.productSlug ? (
                <Link href={`/product/${item.productSlug}`} className="block truncate font-medium hover:underline">
                  {item.productName}
                </Link>
              ) : (
                <span className="block truncate font-medium">{item.productName}</span>
              )}
              <span className="text-stone">
                {variantCaption(item.colorName, item.sizeLabel)} × {item.quantity}
              </span>
            </span>
            <span className="tabular-nums">{format(item.totalPrice)}</span>
          </li>
        ))}
      </ul>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-selvedge pt-3">
        <p className="font-semibold tabular-nums">Total {format(order.total)}</p>
        <div className="flex gap-2">
          {order.status === "delivered" ? (
            <button type="button" onClick={onReturn} className="h-10 rounded border border-ink px-4 text-sm font-semibold hover:bg-ink hover:text-chalk">
              Return or exchange
            </button>
          ) : null}
          {canCancel(order.status) ? (
            <button type="button" disabled={busy} onClick={() => void cancel()} className="h-10 rounded px-3 text-sm font-semibold underline underline-offset-4 disabled:opacity-60">
              Cancel order
            </button>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
