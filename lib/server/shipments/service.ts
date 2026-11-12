import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ORDER_NOTES } from "@/lib/constants/orders";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { ORDER_TX_OPTIONS } from "@/lib/server/orders/place";
import { transitionOrder } from "@/lib/server/orders/status";
import { canMoveOrder } from "@/utils/orders/status";
import { toShipmentResponse } from "@/utils/mappers/payment";
import type { ShipmentResponse } from "@/types/commerce/order";
import type { CreateShipmentInput, UpdateShipmentInput } from "./schemas";

type Tx = Prisma.TransactionClient;

async function requireOrder(orderId: string) {
  const exists = await prisma.order.count({ where: { id: orderId } });
  if (!exists) throw notFound(ERROR_MESSAGES.order.notFound(orderId));
}

async function requireShipment(db: Pick<Tx, "shipment">, id: string) {
  const shipment = await db.shipment.findUnique({ where: { id } });
  if (!shipment) throw notFound(ERROR_MESSAGES.shipment.notFound(id));
  return shipment;
}

/** Moves the order along with its parcel when that is a legal step; otherwise leaves it. */
async function followOrder(tx: Tx, orderId: string, to: OrderStatus, note: string, userId: string): Promise<void> {
  const order = await tx.order.findUnique({ where: { id: orderId }, select: { status: true } });
  if (!order || order.status === to || !canMoveOrder(order.status, to)) return;
  await transitionOrder(tx, orderId, to, { note, changedById: userId });
}

export async function createShipment(input: CreateShipmentInput): Promise<ShipmentResponse> {
  await requireOrder(input.orderId);
  const row = await prisma.shipment.create({
    data: { orderId: input.orderId, courierName: input.courierName, trackingNumber: input.trackingNumber ?? null },
  });
  return toShipmentResponse(row);
}

export async function shipmentsForOrder(orderId: string): Promise<ShipmentResponse[]> {
  const rows = await prisma.shipment.findMany({ where: { orderId }, orderBy: { createdAt: "desc" } });
  return rows.map(toShipmentResponse);
}

export async function updateShipment(id: string, input: UpdateShipmentInput): Promise<ShipmentResponse> {
  await requireShipment(prisma, id);
  if (input.orderId) await requireOrder(input.orderId);
  const row = await prisma.shipment.update({ where: { id }, data: input });
  return toShipmentResponse(row);
}

/** PATCH /shipments/:id/shipped — the parcel left; a pending/processing order becomes shipped. */
export async function markShipped(id: string, staff: CurrentUser): Promise<ShipmentResponse> {
  const row = await prisma.$transaction(async (tx) => {
    const shipment = await requireShipment(tx, id);
    const updated = await tx.shipment.update({ where: { id }, data: { shippedAt: new Date(), status: "in_transit" } });
    await followOrder(tx, shipment.orderId, "shipped", ORDER_NOTES.shippedByCourier(shipment.courierName), staff.id);
    return updated;
  }, ORDER_TX_OPTIONS);
  return toShipmentResponse(row);
}

/** PATCH /shipments/:id/delivered — delivered; the order follows (this date opens the return window). */
export async function markDelivered(id: string, staff: CurrentUser): Promise<ShipmentResponse> {
  const row = await prisma.$transaction(async (tx) => {
    const shipment = await requireShipment(tx, id);
    const now = new Date();
    const updated = await tx.shipment.update({
      where: { id },
      data: { deliveredAt: now, shippedAt: shipment.shippedAt ?? now, status: "delivered" },
    });
    await followOrder(tx, shipment.orderId, "delivered", ORDER_NOTES.deliveredByCourier(shipment.courierName), staff.id);
    return updated;
  }, ORDER_TX_OPTIONS);
  return toShipmentResponse(row);
}
