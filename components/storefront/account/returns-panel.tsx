"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { RETURN_REASON_LABELS, RETURN_STATUS_LABELS } from "@/lib/constants/storefront";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { cancelReturn, listMyReturns } from "@/lib/storefront/orders-api";
import { errorText } from "@/utils/api-error";
import { formatOrderDate, variantCaption } from "@/utils/storefront/orders";
import { EmptyState } from "../shared/empty-state";
import { LabelTag } from "../shared/label-tag";
import { useRemoteList } from "./use-remote-list";

/** Return and exchange requests with their status; open requests can be withdrawn. */
export function ReturnsPanel() {
  const load = useCallback(() => listMyReturns().then((page) => page.data), []);
  const { items: requests, error, reload } = useRemoteList(load, ERROR_MESSAGES.storefront.returnsLoadFailed);

  async function withdraw(id: string) {
    try {
      await cancelReturn(id);
      toast(SUCCESS_MESSAGES.storefront.returnCancelled);
      void reload();
    } catch (caught) {
      toast.error(errorText(caught, ERROR_MESSAGES.ui.generic));
    }
  }

  if (requests === null) return <div className="h-48 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading returns" />;
  if (error) return <EmptyState tone="error" title="Returns did not load" body={error} />;
  if (requests.length === 0) {
    return <EmptyState title="No returns" body="To return or exchange something, open a delivered order and choose Return or exchange." action={{ label: "See your orders", href: "/profile?tab=orders" }} />;
  }

  return (
    <ul className="flex flex-col gap-4">
      {requests.map((request) => (
        <li key={request.id} className="rounded bg-paper p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold">{request.requestNumber}</h3>
              <p className="text-sm text-stone">
                Order {request.order.orderNumber}, requested {formatOrderDate(request.createdAt)}.{" "}
                {request.resolution === "EXCHANGE" ? "Exchange" : "Refund"}
              </p>
            </div>
            <LabelTag tone={request.status === "REQUESTED" ? "dye" : "ink"}>{RETURN_STATUS_LABELS[request.status]}</LabelTag>
          </div>
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {request.items.map((item) => (
              <li key={item.id}>
                {item.orderItem.productName} ({variantCaption(item.orderItem.colorName, item.orderItem.sizeLabel)}) × {item.quantity}:{" "}
                <span className="text-stone">{RETURN_REASON_LABELS[item.reason]}</span>
                {item.exchangeVariant ? (
                  <span className="text-stone">
                    , exchanging for {item.exchangeVariant.color.name} size {item.exchangeVariant.size.label}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          {request.adminNote ? <p className="mt-2 text-sm">Note from Rooq: {request.adminNote}</p> : null}
          {request.status === "REQUESTED" ? (
            <button type="button" onClick={() => void withdraw(request.id)} className="mt-3 text-sm font-semibold underline underline-offset-4">
              Withdraw request
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
