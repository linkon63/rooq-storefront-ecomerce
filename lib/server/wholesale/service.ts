import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { newWholesaleNumber } from "@/lib/server/orders/numbers";
import { notifyStaff, notifyUser, safely } from "@/lib/server/orders/notify";
import { canMoveWholesale, wholesaleLineKey, wholesaleStatusMessage } from "@/utils/orders/wholesale";
import { toWholesaleResponse } from "@/utils/mappers/wholesale";
import type { WholesaleRequestResponse } from "@/types/commerce/wholesale";
import type { CreateWholesaleInput, ListWholesaleQuery, UpdateWholesaleStatusInput } from "./schemas";
import { wholesaleDetailInclude, wholesaleInclude } from "./select";

type Db = Pick<Prisma.TransactionClient, "wholesaleOrderRequest">;

export async function loadWholesale(id: string, db: Db = prisma, userId?: string): Promise<WholesaleRequestResponse> {
  const row = await db.wholesaleOrderRequest.findFirst({ where: { id, ...(userId ? { userId } : {}) }, include: wholesaleDetailInclude });
  if (!row) throw notFound(ERROR_MESSAGES.wholesale.notFound(id));
  return toWholesaleResponse(row);
}

async function assertItems(input: CreateWholesaleInput): Promise<void> {
  const seen = new Set<string>();
  for (const item of input.items) {
    const key = wholesaleLineKey(item.productId, item.variantId);
    if (seen.has(key)) throw badRequest(ERROR_MESSAGES.wholesale.duplicateItem);
    seen.add(key);
  }

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const productCount = await prisma.product.count({ where: { id: { in: productIds } } });
  if (productCount !== productIds.length) throw notFound(ERROR_MESSAGES.product.someNotFound);

  const variantIds = input.items.map((item) => item.variantId).filter((id): id is string => Boolean(id));
  if (!variantIds.length) return;
  const variants = await prisma.productVariant.findMany({ where: { id: { in: variantIds } }, select: { id: true, productId: true } });
  const byId = new Map(variants.map((variant) => [variant.id, variant]));
  for (const item of input.items) {
    if (!item.variantId) continue;
    const variant = byId.get(item.variantId);
    if (!variant) throw notFound(ERROR_MESSAGES.variant.notFoundShort(item.variantId));
    if (variant.productId !== item.productId) throw badRequest(ERROR_MESSAGES.variant.notInProduct(item.variantId, item.productId));
  }
}

/** POST /wholesale-requests — a customer asks for bulk pricing. */
export async function createWholesaleRequest(userId: string, input: CreateWholesaleInput): Promise<WholesaleRequestResponse> {
  await assertItems(input);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { phone: true } });

  const row = await prisma.wholesaleOrderRequest.create({
    data: {
      requestNumber: newWholesaleNumber(),
      status: "pending",
      customerNote: input.customerNote ?? null,
      contactPhone: input.contactPhone || user?.phone || null,
      userId,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          requestedQuantity: item.requestedQuantity,
          targetPrice: item.targetPrice ?? null,
          note: item.note ?? null,
        })),
      },
    },
    include: wholesaleInclude,
  });

  await safely(
    () =>
      notifyStaff({
        type: "ORDER",
        title: "New wholesale order request",
        message: `Request ${row.requestNumber} was submitted and is awaiting review.`,
        link: "/admin/wholesale-requests",
      }),
    `wholesale ${row.requestNumber}`,
  );
  return toWholesaleResponse(row);
}

/** GET /wholesale-requests/me */
export async function myWholesaleRequests(userId: string): Promise<WholesaleRequestResponse[]> {
  const rows = await prisma.wholesaleOrderRequest.findMany({ where: { userId }, include: wholesaleInclude, orderBy: { createdAt: "desc" } });
  return rows.map(toWholesaleResponse);
}

/** GET /wholesale-requests (staff) */
export async function listWholesaleRequests(query: ListWholesaleQuery): Promise<WholesaleRequestResponse[]> {
  const rows = await prisma.wholesaleOrderRequest.findMany({
    where: query.status ? { status: query.status } : {},
    include: wholesaleInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toWholesaleResponse);
}

/** PATCH /wholesale-requests/:id/status (staff) — approve, reject, or ask for more info. */
export async function updateWholesaleStatus(id: string, input: UpdateWholesaleStatusInput): Promise<WholesaleRequestResponse> {
  const current = await prisma.wholesaleOrderRequest.findUnique({ where: { id }, select: { status: true, userId: true, requestNumber: true } });
  if (!current) throw notFound(ERROR_MESSAGES.wholesale.notFound(id));
  if (!canMoveWholesale(current.status, input.status)) {
    throw badRequest(ERROR_MESSAGES.wholesale.invalidTransition(current.status, input.status));
  }

  await prisma.wholesaleOrderRequest.update({
    where: { id },
    data: {
      status: input.status,
      reviewedAt: new Date(),
      ...(input.status === "info_requested" ? { infoRequestMessage: input.note ?? null } : input.note ? { adminNote: input.note } : {}),
    },
  });

  await safely(
    () =>
      notifyUser({
        userId: current.userId,
        type: "ORDER",
        title: "Wholesale request update",
        message: wholesaleStatusMessage(input.status, current.requestNumber, input.note),
      }),
    `wholesale ${current.requestNumber}`,
  );
  return loadWholesale(id);
}
