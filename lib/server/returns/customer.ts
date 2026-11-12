import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { isStaff } from "@/lib/server/orders/queries";
import { newReturnNumber } from "@/lib/server/orders/numbers";
import { notifyStaff, safely } from "@/lib/server/orders/notify";
import { loadDeliverySettings } from "@/lib/server/orders/shipping";
import { mediaSrc } from "@/utils/media-url";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { claimedQuantity, deliveryDate, returnDeadline, returnableQuantity } from "@/utils/orders/returns";
import { toReturnResponse } from "@/utils/mappers/returns";
import type { ReturnableOrderResponse, ReturnRequestResponse } from "@/types/commerce/returns";
import type { CreateReturnInput } from "./schemas";
import { returnableOrderSelect, returnInclude, type ReturnableOrderRow } from "./select";

type Tx = Prisma.TransactionClient;

export async function loadReturn(id: string, db: Pick<Tx, "returnRequest"> = prisma): Promise<ReturnRequestResponse> {
  const row = await db.returnRequest.findUnique({ where: { id }, include: returnInclude });
  if (!row) throw notFound(ERROR_MESSAGES.returns.notFound(id));
  return toReturnResponse(row);
}

/** Why an order cannot take a return right now, or null; plus the deadline. */
function eligibility(order: ReturnableOrderRow, windowDays: number, now: Date): { problem: string | null; deadline: Date | null } {
  const deadline = returnDeadline(deliveryDate(order.shipments, order.statusLogs), windowDays);
  if (order.status !== "delivered") return { problem: ERROR_MESSAGES.returns.orderNotDelivered, deadline };
  if (!deadline) return { problem: ERROR_MESSAGES.returns.noDeliveryDate, deadline };
  if (now > deadline) return { problem: ERROR_MESSAGES.returns.windowClosed(windowDays), deadline };
  return { problem: null, deadline };
}

async function loadOwnedOrder(db: Pick<Tx, "order">, orderId: string, user: CurrentUser): Promise<ReturnableOrderRow> {
  const order = await db.order.findUnique({ where: { id: orderId }, select: returnableOrderSelect });
  if (!order || (order.userId !== user.id && !isStaff(user))) throw notFound(ERROR_MESSAGES.order.notFound(orderId));
  return order;
}

/** GET /orders/:id/returnable */
export async function returnableFor(orderId: string, user: CurrentUser): Promise<ReturnableOrderResponse> {
  const [order, settings] = await Promise.all([loadOwnedOrder(prisma, orderId, user), loadDeliverySettings()]);
  const { problem, deadline } = eligibility(order, settings.returnWindowDays, new Date());
  return {
    eligible: problem === null,
    ...(problem ? { reason: problem } : {}),
    deadline: deadline ? deadline.toISOString() : null,
    items: order.items.map((item) => ({
      orderItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      colorName: item.colorName,
      sizeLabel: item.sizeLabel,
      quantity: item.quantity,
      returnableQuantity: problem ? 0 : returnableQuantity(item.quantity, claimedQuantity(item.returnItems)),
      image: mediaSrc(item.imageMedia),
    })),
  };
}

/** Exchange targets must be active variants of the same product. */
async function assertExchangeVariants(tx: Tx, input: CreateReturnInput, order: ReturnableOrderRow): Promise<void> {
  const ids = input.items.map((item) => item.exchangeVariantId).filter((id): id is string => Boolean(id));
  const variants = await tx.productVariant.findMany({ where: { id: { in: ids } }, select: { id: true, productId: true, isActive: true } });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));
  for (const item of input.items) {
    const line = order.items.find((row) => row.id === item.orderItemId);
    const variant = item.exchangeVariantId ? byId.get(item.exchangeVariantId) : undefined;
    if (!variant || !variant.isActive || variant.productId !== line?.productId) {
      throw badRequest(ERROR_MESSAGES.returns.exchangeVariantInvalid);
    }
  }
}

function assertItems(input: CreateReturnInput, order: ReturnableOrderRow): void {
  const seen = new Set<string>();
  for (const item of input.items) {
    if (seen.has(item.orderItemId)) throw badRequest(ERROR_MESSAGES.returns.duplicateItem);
    seen.add(item.orderItemId);

    const line = order.items.find((row) => row.id === item.orderItemId);
    if (!line) throw badRequest(ERROR_MESSAGES.returns.itemNotInOrder(item.orderItemId));
    const max = returnableQuantity(line.quantity, claimedQuantity(line.returnItems));
    if (item.quantity > max) throw badRequest(ERROR_MESSAGES.returns.quantityExceeded(line.sku, max));

    if (input.resolution === "EXCHANGE" && !item.exchangeVariantId) throw badRequest(ERROR_MESSAGES.returns.exchangeVariantRequired);
    if (input.resolution === "REFUND" && item.exchangeVariantId) throw badRequest(ERROR_MESSAGES.returns.exchangeOnlyForExchange);
  }
}

/** POST /returns — the customer opens a return/exchange on a delivered order. */
export async function createReturn(user: CurrentUser, input: CreateReturnInput): Promise<ReturnRequestResponse> {
  const settings = await loadDeliverySettings();
  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { id: input.orderId, userId: user.id }, select: returnableOrderSelect });
    if (!order) throw notFound(ERROR_MESSAGES.order.notFound(input.orderId));
    const { problem } = eligibility(order, settings.returnWindowDays, new Date());
    if (problem) throw badRequest(problem);
    assertItems(input, order);
    if (input.resolution === "EXCHANGE") await assertExchangeVariants(tx, input, order);

    return tx.returnRequest.create({
      data: {
        requestNumber: newReturnNumber(),
        resolution: input.resolution,
        customerNote: input.customerNote ?? null,
        orderId: order.id,
        userId: user.id,
        items: {
          create: input.items.map((item) => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            reason: item.reason,
            note: item.note ?? null,
            exchangeVariantId: item.exchangeVariantId ?? null,
          })),
        },
      },
      select: { id: true, requestNumber: true, order: { select: { orderNumber: true } } },
    });
  });

  await safely(
    () =>
      notifyStaff({
        type: "RETURN",
        title: "New return request",
        message: `Return ${created.requestNumber} was opened on order ${created.order.orderNumber}.`,
        link: "/admin/returns",
      }),
    `return ${created.requestNumber}`,
  );
  return loadReturn(created.id);
}

/** GET /returns/my */
export async function myReturns(userId: string, query: { page?: number; limit?: number }) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where = { userId };
  const [rows, total] = await prisma.$transaction([
    prisma.returnRequest.findMany({ where, include: returnInclude, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.returnRequest.count({ where }),
  ]);
  return { data: rows.map(toReturnResponse), meta: buildPaginationMeta({ page, limit, total }) };
}

/** GET /returns/:id — owner or staff (others get 404). */
export async function getReturnFor(id: string, user: CurrentUser): Promise<ReturnRequestResponse> {
  const row = await prisma.returnRequest.findUnique({ where: { id }, select: { userId: true } });
  if (!row || (row.userId !== user.id && !isStaff(user))) throw notFound(ERROR_MESSAGES.returns.notFound(id));
  return loadReturn(id);
}

/** POST /returns/:id/cancel — the owner withdraws a request nobody has reviewed yet. */
export async function cancelOwnReturn(id: string, user: CurrentUser): Promise<ReturnRequestResponse> {
  const row = await prisma.returnRequest.findUnique({ where: { id }, select: { userId: true, status: true } });
  if (!row || row.userId !== user.id) throw notFound(ERROR_MESSAGES.returns.notFound(id));
  if (row.status !== "REQUESTED") throw badRequest(ERROR_MESSAGES.returns.onlyRequestedCancellable);
  await prisma.returnRequest.update({ where: { id }, data: { status: "CANCELLED", resolvedAt: new Date() } });
  return loadReturn(id);
}
