"use client";

import { useState } from "react";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { listMyOrders } from "@/lib/storefront/orders-api";
import type { Order } from "@/types/storefront/commerce";
import { EmptyState } from "../shared/empty-state";
import { OrderCard } from "./order-card";
import { ReturnRequestDialog } from "./return-request-dialog";
import { useRemoteList } from "./use-remote-list";

export function OrdersPanel() {
  const { items: orders, error, reload } = useRemoteList(listMyOrders, ERROR_MESSAGES.storefront.ordersLoadFailed);
  const [returning, setReturning] = useState<Order | null>(null);

  if (orders === null) return <div className="h-48 animate-pulse rounded bg-selvedge" aria-busy="true" aria-label="Loading orders" />;
  if (error) return <EmptyState tone="error" title="Orders did not load" body={error} />;
  if (orders.length === 0) return <EmptyState title="No orders yet" body="When you place an order it will show up here." action={{ label: "Shop new in", href: "/new" }} />;

  return (
    <>
      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} onChanged={() => void reload()} onReturn={() => setReturning(order)} />
          </li>
        ))}
      </ul>
      {returning ? <ReturnRequestDialog order={returning} onClose={() => setReturning(null)} /> : null}
    </>
  );
}
