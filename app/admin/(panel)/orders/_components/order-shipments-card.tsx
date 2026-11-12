"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { createShipment, getAdminOrder, markShipment } from "@/lib/admin-api/commerce";
import type { OrderResponse as Order } from "@/types/commerce/order";
import { formatDateTime } from "@/utils/format-date";
import { humanize } from "@/utils/orders/display";
import { ShipmentForm } from "./shipment-form";

const errorText = (error: unknown) => (error instanceof Error && error.message ? error.message : ERROR_MESSAGES.shipment.saveFailed);

/**
 * Courier hand-off. Marking a parcel shipped / delivered moves the order with
 * it, and the delivery time opens the customer's return window.
 */
export function OrderShipmentsCard({ order, onChanged }: { order: Order; onChanged: (order: Order) => void }) {
  const [busy, setBusy] = useState(false);
  const open = order.status !== "cancelled" && order.status !== "returned";

  async function run(task: () => Promise<unknown>): Promise<boolean> {
    setBusy(true);
    try {
      await task();
      onChanged(await getAdminOrder(order.id));
      toast.success(SUCCESS_MESSAGES.commerce.shipmentSaved);
      return true;
    } catch (error) {
      toast.error(errorText(error));
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!open && order.shipments.length === 0) return null;
  return (
    <section className="mt-4 rounded-lg border border-slate-200/60 bg-white p-5 shadow-xs">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Shipments</h3>
      <ul className="mb-4 space-y-3">
        {order.shipments.map((shipment) => (
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-100 p-3 text-xs" key={shipment.id}>
            <div>
              <p className="font-semibold text-slate-800">
                {shipment.courierName}
                {shipment.trackingNumber ? <span className="ml-2 font-mono text-slate-500">{shipment.trackingNumber}</span> : null}
              </p>
              <p className="mt-0.5 capitalize text-slate-500">
                {humanize(shipment.status)}
                {shipment.deliveredAt ? ` · ${formatDateTime(shipment.deliveredAt)}` : shipment.shippedAt ? ` · ${formatDateTime(shipment.shippedAt)}` : ""}
              </p>
            </div>
            {open ? (
              <div className="flex gap-2">
                {!shipment.shippedAt ? (
                  <button className="h-9 rounded-lg border border-slate-300 px-3 font-semibold disabled:opacity-50" disabled={busy} onClick={() => run(() => markShipment(shipment.id, "shipped"))} type="button">
                    Mark shipped
                  </button>
                ) : null}
                {!shipment.deliveredAt ? (
                  <button className="h-9 rounded-lg bg-emerald-600 px-3 font-semibold text-white disabled:opacity-50" disabled={busy} onClick={() => run(() => markShipment(shipment.id, "delivered"))} type="button">
                    Mark delivered
                  </button>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {open ? <ShipmentForm busy={busy} onSubmit={(input) => run(() => createShipment({ orderId: order.id, ...input }))} /> : null}
    </section>
  );
}
