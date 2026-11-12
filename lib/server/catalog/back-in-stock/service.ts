import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { badRequest, notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { toBackInStock, type BackInStockSummaryRow } from "@/utils/mappers/back-in-stock";
import { colorRefSelect, sizeRefSelect } from "../selects";
import { notifyBackInStock } from "./notify";
import type { BackInStockListQuery } from "./schemas";

const requestSelect = {
  id: true, email: true, status: true, createdAt: true, notifiedAt: true,
  user: { select: { id: true, name: true } },
  variant: {
    select: {
      id: true, sku: true, stock: true,
      color: { select: colorRefSelect }, size: { select: sizeRefSelect },
      product: { select: { id: true, name: true, slug: true } },
    },
  },
} as const satisfies Prisma.BackInStockRequestSelect;

/** POST /back-in-stock — idempotent per (variant, email); a cancelled request is re-opened. */
export async function requestBackInStock(input: { variantId: string; email: string }, userId: string | null) {
  const variant = await prisma.productVariant.findUnique({ where: { id: input.variantId }, select: { stock: true, isActive: true } });
  if (!variant || !variant.isActive) throw notFound(ERROR_MESSAGES.variant.notFound(input.variantId));
  if (variant.stock > 0) throw badRequest(ERROR_MESSAGES.backInStock.alreadyInStock);
  const row = await prisma.backInStockRequest.upsert({
    where: { variantId_email: { variantId: input.variantId, email: input.email } },
    create: { variantId: input.variantId, email: input.email, userId },
    update: { status: "PENDING", notifiedAt: null, ...(userId ? { userId } : {}) },
    select: { id: true, status: true },
  });
  return row;
}

export async function listBackInStock(query: BackInStockListQuery) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.BackInStockRequestWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.variantId ? { variantId: query.variantId } : {}),
    ...(query.productId ? { variant: { productId: query.productId } } : {}),
    ...(query.search
      ? { OR: [{ email: { contains: query.search, mode: "insensitive" } }, { variant: { sku: { contains: query.search, mode: "insensitive" } } }, { variant: { product: { name: { contains: query.search, mode: "insensitive" } } } }] }
      : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.backInStockRequest.findMany({ where, select: requestSelect, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.backInStockRequest.count({ where }),
  ]);
  return { data: rows.map(toBackInStock), meta: buildPaginationMeta({ page, limit, total }) };
}

/** Most-requested variants first (pending requests only). */
export async function backInStockSummary(): Promise<BackInStockSummaryRow[]> {
  const groups = await prisma.backInStockRequest.groupBy({
    by: ["variantId"],
    where: { status: "PENDING" },
    _count: { _all: true },
    orderBy: { _count: { variantId: "desc" } },
  });
  if (!groups.length) return [];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: groups.map((g) => g.variantId) } },
    select: { id: true, sku: true, stock: true, color: { select: { name: true } }, size: { select: { label: true } }, product: { select: { id: true, name: true } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  return groups.flatMap((group) => {
    const v = byId.get(group.variantId);
    if (!v) return [];
    return [{ variantId: v.id, sku: v.sku, productId: v.product.id, productName: v.product.name, colorName: v.color.name, sizeLabel: v.size.label, stock: v.stock, pending: group._count._all }];
  });
}

export async function notifyVariant(variantId: string) {
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId }, select: { stock: true } });
  if (!variant) throw notFound(ERROR_MESSAGES.variant.notFound(variantId));
  if (variant.stock <= 0) throw badRequest(ERROR_MESSAGES.inventory.outOfStock);
  return { notified: await notifyBackInStock(variantId) };
}

export async function removeBackInStock(id: string) {
  const row = await prisma.backInStockRequest.findUnique({ where: { id }, select: { id: true } });
  if (!row) throw notFound(ERROR_MESSAGES.backInStock.notFound(id));
  await prisma.backInStockRequest.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Back-in-stock request") };
}
