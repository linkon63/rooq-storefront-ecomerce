import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { ReturnStatus } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ORDER_NOTES } from "@/lib/constants/orders";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { moveStock } from "@/lib/server/catalog/inventory/stock";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { notifyUser, safely } from "@/lib/server/orders/notify";
import { ORDER_TX_OPTIONS } from "@/lib/server/orders/place";
import { restockOrderLines } from "@/lib/server/orders/stock";
import { roundMoney } from "@/utils/catalog/price";
import { toNumber } from "@/utils/decimal";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { ACCEPTED_RETURN_STATUSES, canMoveReturn, defaultRefundAmount, isFullyReturned } from "@/utils/orders/returns";
import { paymentStatusAfterRefund } from "@/utils/orders/status";
import { toReturnResponse } from "@/utils/mappers/returns";
import type { ReturnRequestResponse } from "@/types/commerce/returns";
import { loadReturn } from "./customer";
import type { ListReturnsQuery, UpdateReturnStatusInput } from "./schemas";
import { returnInclude } from "./select";

type Tx = Prisma.TransactionClient;

const workSelect = {
  id: true,
  requestNumber: true,
  status: true,
  resolution: true,
  userId: true,
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      payments: { select: { method: true, status: true, amount: true }, orderBy: { createdAt: "desc" } },
      items: { select: { id: true, quantity: true, returnItems: { select: { quantity: true, returnRequestId: true, returnRequest: { select: { status: true } } } } } },
    },
  },
  items: {
    select: {
      id: true,
      quantity: true,
      restocked: true,
      exchangeVariantId: true,
      orderItem: { select: { id: true, variantId: true, productId: true, unitPrice: true } },
    },
  },
} as const satisfies Prisma.ReturnRequestSelect;

type ReturnWork = Prisma.ReturnRequestGetPayload<{ select: typeof workSelect }>;

/** GET /returns (staff) */
export async function listReturns(query: ListReturnsQuery) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const contains = query.search ? { contains: query.search, mode: "insensitive" as const } : undefined;
  const where: Prisma.ReturnRequestWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(contains
      ? { OR: [{ requestNumber: contains }, { order: { orderNumber: contains } }, { user: { email: contains } }, { user: { name: contains } }] }
      : {}),
    ...(query.from || query.to ? { createdAt: { gte: query.from, lte: query.to } } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.returnRequest.findMany({ where, include: returnInclude, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.returnRequest.count({ where }),
  ]);
  return { data: rows.map(toReturnResponse), meta: buildPaginationMeta({ page, limit, total }) };
}

async function approve(tx: Tx, work: ReturnWork, restock: boolean, userId: string): Promise<void> {
  if (restock) {
    const lines = work.items.filter((item) => !item.restocked);
    await restockOrderLines(
      tx,
      lines.map((item) => ({ variantId: item.orderItem.variantId, productId: item.orderItem.productId, quantity: item.quantity })),
      { orderId: work.order.id, type: "RETURN", reason: ORDER_NOTES.restockReturn(work.requestNumber), userId, returnRequestId: work.id },
    );
    await tx.returnItem.updateMany({ where: { id: { in: lines.map((item) => item.id) } }, data: { restocked: true } });
  }

  // Every unit of the order accepted back (this request + earlier approved ones) → the order is returned.
  const accepted = (row: { returnRequestId: string; returnRequest: { status: ReturnStatus } }) =>
    row.returnRequestId === work.id || ACCEPTED_RETURN_STATUSES.includes(row.returnRequest.status);
  const returnedByLine = work.order.items.map((line) => ({
    quantity: line.quantity,
    returned: line.returnItems.reduce((sum, row) => (accepted(row) ? sum + row.quantity : sum), 0),
  }));
  if (work.order.status === "delivered" && isFullyReturned(returnedByLine)) {
    await tx.order.update({
      where: { id: work.order.id },
      data: { status: "returned", statusLogs: { create: { status: "returned", note: ORDER_NOTES.returnedInFull(work.requestNumber), changedById: userId } } },
    });
  }
}

async function refund(tx: Tx, work: ReturnWork, requested: number | undefined): Promise<number> {
  const orderTotal = toNumber(work.order.total);
  const refundedBefore = work.order.payments.filter((p) => p.status === "refunded").reduce((sum, p) => sum + toNumber(p.amount), 0);
  const max = roundMoney(Math.max(orderTotal - refundedBefore, 0));
  const amount = requested ?? Math.min(defaultRefundAmount(work.items.map((i) => ({ unitPrice: toNumber(i.orderItem.unitPrice), quantity: i.quantity }))), max);
  if (amount > max) throw badRequest(ERROR_MESSAGES.returns.refundTooHigh(`৳${max.toLocaleString("en-US")}`));

  const method = work.order.payments.find((p) => p.status === "success")?.method ?? "other";
  await tx.payment.create({ data: { orderId: work.order.id, amount, method, status: "refunded", paidAt: new Date() } });
  await tx.order.update({ where: { id: work.order.id }, data: { paymentStatus: paymentStatusAfterRefund(refundedBefore + amount, orderTotal) } });
  return amount;
}

async function exchange(tx: Tx, work: ReturnWork, userId: string): Promise<void> {
  for (const item of work.items) {
    if (!item.exchangeVariantId) continue;
    await moveStock(tx, {
      variantId: item.exchangeVariantId,
      quantity: -item.quantity,
      type: "EXCHANGE",
      reason: ORDER_NOTES.exchangeOut(work.requestNumber),
      orderId: work.order.id,
      returnRequestId: work.id,
      userId,
    });
  }
}

/** PATCH /returns/:id/status (staff) — each transition and its side effects in one transaction. */
export async function updateReturnStatus(id: string, input: UpdateReturnStatusInput, staff: CurrentUser): Promise<ReturnRequestResponse> {
  const work = await prisma.$transaction(async (tx) => {
    const current = await tx.returnRequest.findUnique({ where: { id }, select: workSelect });
    if (!current) throw notFound(ERROR_MESSAGES.returns.notFound(id));
    if (!canMoveReturn(current.status, input.status, current.resolution)) {
      throw badRequest(ERROR_MESSAGES.returns.invalidTransition(current.status, input.status));
    }

    // Claim the row first so a concurrent update of the same request fails cleanly.
    const now = new Date();
    const claimed = await tx.returnRequest.updateMany({
      where: { id, status: current.status },
      data: {
        status: input.status,
        adminNote: input.adminNote ?? undefined,
        ...(input.status === "APPROVED" ? { approvedAt: now } : { resolvedAt: now }),
      },
    });
    if (claimed.count === 0) throw badRequest(ERROR_MESSAGES.returns.invalidTransition(current.status, input.status));

    if (input.status === "APPROVED") await approve(tx, current, input.restock, staff.id);
    if (input.status === "REFUNDED") {
      const amount = await refund(tx, current, input.refundAmount);
      await tx.returnRequest.update({ where: { id }, data: { refundAmount: amount } });
    }
    if (input.status === "EXCHANGED") await exchange(tx, current, staff.id);
    return current;
  }, ORDER_TX_OPTIONS);

  const userId = work.userId;
  if (userId) {
    await safely(
      () =>
        notifyUser({
          userId,
          type: "RETURN",
          title: `Return ${work.requestNumber}`,
          message: `Your return ${work.requestNumber} is now ${input.status.toLowerCase()}.`,
          link: "/profile?tab=returns",
        }),
      `return ${work.requestNumber}`,
    );
  }
  return loadReturn(id);
}
