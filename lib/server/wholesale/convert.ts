import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { ORDER_NOTES } from "@/lib/constants/orders";
import type { CurrentUser } from "@/lib/server/auth/current-user";
import { badRequest, notFound } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { buildOrderLines, type LineRequest } from "@/lib/server/orders/lines";
import { notifyUser, safely } from "@/lib/server/orders/notify";
import { ORDER_TX_OPTIONS, placeOrder } from "@/lib/server/orders/place";
import { loadOrder } from "@/lib/server/orders/queries";
import { sumLines } from "@/utils/orders/pricing";
import type { OrderResponse } from "@/types/commerce/order";
import type { ConvertWholesaleInput } from "./schemas";

type Tx = Prisma.TransactionClient;
type RequestItem = { id: string; productId: string; variantId: string | null };

/** Explicit variant → the product's default → its oldest variant; must belong to the product. */
async function resolveVariantId(tx: Tx, productId: string, variantId: string | undefined): Promise<string> {
  const variant = variantId
    ? await tx.productVariant.findUnique({ where: { id: variantId }, select: { id: true, productId: true } })
    : ((await tx.productVariant.findFirst({ where: { productId, isDefault: true }, select: { id: true, productId: true } })) ??
      (await tx.productVariant.findFirst({ where: { productId }, orderBy: { createdAt: "asc" }, select: { id: true, productId: true } })));
  if (!variant) throw badRequest(ERROR_MESSAGES.variant.noneForProduct(productId));
  if (variant.productId !== productId) throw badRequest(ERROR_MESSAGES.variant.notInProduct(variant.id, productId));
  return variant.id;
}

async function resolveLines(tx: Tx, input: ConvertWholesaleInput, requestItems: readonly RequestItem[]): Promise<LineRequest[]> {
  const lines: LineRequest[] = [];
  for (const line of input.items) {
    let productId = line.productId;
    let variantId = line.variantId;
    if (line.requestItemId) {
      const item = requestItems.find((row) => row.id === line.requestItemId);
      if (!item) throw badRequest(ERROR_MESSAGES.wholesale.itemNotInRequest(line.requestItemId));
      productId = item.productId;
      variantId = variantId ?? item.variantId ?? undefined;
    }
    if (!productId) throw badRequest(ERROR_MESSAGES.wholesale.itemNeedsId);
    lines.push({ variantId: await resolveVariantId(tx, productId, variantId), quantity: line.quantity, unitPrice: line.unitPrice });
  }
  if (new Set(lines.map((line) => line.variantId)).size !== lines.length) throw badRequest(ERROR_MESSAGES.wholesale.duplicateVariant);
  return lines;
}

/** POST /wholesale-requests/:id/convert (staff) — an approved request becomes a wholesale order. */
export async function convertWholesaleRequest(id: string, input: ConvertWholesaleInput, staff: CurrentUser): Promise<OrderResponse> {
  const request = await prisma.wholesaleOrderRequest.findUnique({
    where: { id },
    select: { id: true, status: true, orderId: true, userId: true, requestNumber: true, items: { select: { id: true, productId: true, variantId: true } } },
  });
  if (!request) throw notFound(ERROR_MESSAGES.wholesale.notFound(id));
  if (request.status !== "approved") throw badRequest(ERROR_MESSAGES.wholesale.notApproved);
  if (request.orderId) throw badRequest(ERROR_MESSAGES.wholesale.alreadyConverted);

  const [address, user] = await Promise.all([
    prisma.address.findFirst({ where: { id: input.addressId, userId: request.userId } }),
    prisma.user.findUnique({ where: { id: request.userId }, select: { email: true } }),
  ]);
  if (!address) throw notFound(ERROR_MESSAGES.address.notFoundForCustomer);

  const orderId = await prisma.$transaction(async (tx) => {
    const lines = await buildOrderLines(tx, await resolveLines(tx, input, request.items), { requireSellable: false });
    const shippingCost = input.shippingCost ?? 0;
    const tax = input.tax ?? 0;
    const discount = input.discount ?? 0;
    if (sumLines(lines).payable - discount + shippingCost + tax < 0) throw badRequest(ERROR_MESSAGES.order.negativeTotal);

    const created = await placeOrder(tx, {
      lines,
      userId: request.userId,
      addressId: address.id,
      shippingAddress: {
        email: user?.email ?? null,
        fullName: address.fullName,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      shipping: { fixed: shippingCost },
      manualDiscount: discount,
      tax,
      orderType: "wholesale",
      paymentStatus: input.paymentStatus ?? "unpaid",
      logNote: ORDER_NOTES.wholesaleCreated(request.requestNumber),
      stockReason: ORDER_NOTES.wholesaleCreated(request.requestNumber),
      changedById: staff.id,
    });

    const claimed = await tx.wholesaleOrderRequest.updateMany({
      where: { id: request.id, status: "approved", orderId: null },
      data: { status: "converted", orderId: created, reviewedAt: new Date() },
    });
    if (claimed.count === 0) throw badRequest(ERROR_MESSAGES.wholesale.alreadyConverted);
    return created;
  }, ORDER_TX_OPTIONS);

  const order = await loadOrder(orderId);
  await safely(
    () =>
      notifyUser({
        userId: request.userId,
        type: "ORDER",
        title: "Wholesale order created",
        message: `Your request ${request.requestNumber} was approved and order ${order.orderNumber} was created.`,
        link: "/profile?tab=orders",
      }),
    `wholesale ${request.requestNumber}`,
  );
  return order;
}
