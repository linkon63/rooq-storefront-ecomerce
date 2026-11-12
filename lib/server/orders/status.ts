import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { OrderStatus } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ORDER_NOTES, ORDER_STATUS_COPY } from "@/lib/constants/orders";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { releaseCoupon } from "@/lib/server/coupons/service";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { canMoveOrder, isCustomerCancellable } from "@/utils/orders/status";
import type { OrderResponse } from "@/types/commerce/order";
import { notifyUser, safely } from "./notify";
import { ORDER_TX_OPTIONS } from "./place";
import { loadOrder } from "./queries";
import type { UpdateOrderStatusInput } from "./schemas";
import { restockOrderLines } from "./stock";

type Tx = Prisma.TransactionClient;

const stockLinesSelect = {
  id: true,
  status: true,
  userId: true,
  orderNumber: true,
  couponId: true,
  items: {
    select: {
      id: true,
      variantId: true,
      productId: true,
      quantity: true,
      returnItems: { where: { restocked: true }, select: { quantity: true } },
    },
  },
} as const satisfies Prisma.OrderSelect;

type StockedOrder = Prisma.OrderGetPayload<{ select: typeof stockLinesSelect }>;

/** Stock side effects of entering `to`: cancelled restocks everything, returned restocks what returns did not. */
async function applyStockEffects(tx: Tx, order: StockedOrder, to: OrderStatus, userId: string | null): Promise<void> {
  if (to === "cancelled") {
    await restockOrderLines(tx, order.items, {
      orderId: order.id,
      type: "CANCELLATION",
      reason: ORDER_NOTES.stockCancelled(order.orderNumber),
      userId,
    });
    await releaseCoupon(tx, order.couponId);
  }
  if (to === "returned") {
    const remaining = order.items.map((item) => ({
      ...item,
      quantity: item.quantity - item.returnItems.reduce((sum, row) => sum + row.quantity, 0),
    }));
    await restockOrderLines(tx, remaining, { orderId: order.id, type: "RETURN", reason: ORDER_NOTES.stockReturned(order.orderNumber), userId });
  }
}

/**
 * Moves an order to `to` inside one transaction: checks the transition,
 * applies the stock effects, files the status log. Shared by the admin status
 * endpoint, customer cancel and the shipment courier hooks.
 */
export async function transitionOrder(
  tx: Tx,
  orderId: string,
  to: OrderStatus,
  options: { note?: string | null; changedById?: string | null },
): Promise<StockedOrder> {
  const order = await tx.order.findUnique({ where: { id: orderId }, select: stockLinesSelect });
  if (!order) throw notFound(ERROR_MESSAGES.order.notFound(orderId));
  if (!canMoveOrder(order.status, to)) throw badRequest(ERROR_MESSAGES.order.invalidTransition(order.status, to));

  if (order.status !== to) await applyStockEffects(tx, order, to, options.changedById ?? null);
  await tx.order.update({
    where: { id: orderId },
    data: {
      status: to,
      statusLogs: { create: { status: to, note: options.note || null, changedById: options.changedById ?? null } },
    },
  });
  return order;
}

function notifyStatus(order: Pick<StockedOrder, "id" | "userId" | "orderNumber">, status: OrderStatus): Promise<void> {
  const userId = order.userId;
  if (!userId) return Promise.resolve();
  return safely(
    () =>
      notifyUser({
        userId,
        type: "ORDER",
        title: `Order ${order.orderNumber}`,
        message: `Your order ${order.orderNumber} ${ORDER_STATUS_COPY[status] ?? status}.`,
        link: "/profile?tab=orders",
      }),
    `order ${order.orderNumber} status`,
  );
}

/** PATCH /orders/:id/status (staff) — { status?, note?, paymentStatus? }. */
export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput, staff: CurrentUser): Promise<OrderResponse> {
  const changed = await prisma.$transaction(async (tx) => {
    const order = input.status ? await transitionOrder(tx, id, input.status, { note: input.note, changedById: staff.id }) : null;
    if (input.paymentStatus) {
      await tx.order.update({ where: { id }, data: { paymentStatus: input.paymentStatus } });
    } else if (!order) {
      const exists = await tx.order.count({ where: { id } });
      if (!exists) throw notFound(ERROR_MESSAGES.order.notFound(id));
    }
    return order && order.status !== input.status ? order : null;
  }, ORDER_TX_OPTIONS);

  if (changed && input.status) await notifyStatus(changed, input.status);
  return loadOrder(id);
}

/** DELETE /orders/:id/cancel — the customer cancels their own order before it ships. */
export async function cancelOwnOrder(id: string, user: CurrentUser): Promise<OrderResponse> {
  const owned = await prisma.order.findFirst({ where: { id, userId: user.id }, select: { status: true } });
  if (!owned) throw notFound(ERROR_MESSAGES.order.notFound(id));
  if (!isCustomerCancellable(owned.status)) throw badRequest(ERROR_MESSAGES.order.cannotCancel);

  await prisma.$transaction(
    (tx) => transitionOrder(tx, id, "cancelled", { note: ORDER_NOTES.cancelledByCustomer, changedById: user.id }),
    ORDER_TX_OPTIONS,
  );
  return loadOrder(id);
}
