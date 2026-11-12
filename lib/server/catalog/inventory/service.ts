import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { VARIANT_MOVEMENTS_LIMIT } from "@/lib/constants/catalog";
import { buildPaginationMeta, pageWindow } from "@/utils/pagination";
import { toInventoryRow, toMovement } from "@/utils/mappers/inventory";
import { moveStock, setStock } from "./stock";
import { inventoryVariantSelect, lowStockWhere, movementSelect, sellableVariantWhere } from "./queries";
import type { InventoryAdjustInput, InventoryListQuery, MovementListQuery } from "./schemas";

const insensitive = (value: string) => ({ contains: value, mode: "insensitive" as const });

function inventoryWhere(query: InventoryListQuery): Prisma.ProductVariantWhereInput {
  const and: Prisma.ProductVariantWhereInput[] = [query.includeInactive ? { product: { archivedAt: null } } : sellableVariantWhere];
  if (query.productId) and.push({ productId: query.productId });
  if (query.search) {
    and.push({
      OR: [{ sku: insensitive(query.search) }, { barcode: insensitive(query.search) }, { product: { name: insensitive(query.search) } }, { product: { styleCode: insensitive(query.search) } }],
    });
  }
  if (query.lowStock && query.outOfStock) and.push({ OR: [lowStockWhere(), { stock: { lte: 0 } }] });
  else if (query.lowStock) and.push(lowStockWhere());
  else if (query.outOfStock) and.push({ stock: { lte: 0 } });
  return { AND: and };
}

function inventoryOrder(sort: InventoryListQuery["sort"]): Prisma.ProductVariantOrderByWithRelationInput[] {
  if (sort === "lowStock" || sort === "stock_asc") return [{ stock: "asc" }, { sku: "asc" }];
  if (sort === "stock_desc") return [{ stock: "desc" }, { sku: "asc" }];
  return [{ product: { createdAt: "desc" } }, { position: "asc" }, { sku: "asc" }];
}

export async function listInventory(query: InventoryListQuery) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where = inventoryWhere(query);
  const [rows, total] = await Promise.all([
    prisma.productVariant.findMany({ where, select: inventoryVariantSelect, orderBy: inventoryOrder(query.sort), skip, take }),
    prisma.productVariant.count({ where }),
  ]);
  return { data: rows.map(toInventoryRow), meta: buildPaginationMeta({ page, limit, total }) };
}

export async function getVariantInventory(variantId: string) {
  const [variant, movements] = await Promise.all([
    prisma.productVariant.findUnique({ where: { id: variantId }, select: inventoryVariantSelect }),
    prisma.stockMovement.findMany({ where: { variantId }, select: movementSelect, orderBy: { createdAt: "desc" }, take: VARIANT_MOVEMENTS_LIMIT }),
  ]);
  if (!variant) throw notFound(ERROR_MESSAGES.variant.notFound(variantId));
  return { ...toInventoryRow(variant), movements: movements.map(toMovement) };
}

/** POST /inventory/adjust — exactly one of `change` (delta) or `setTo` (absolute). */
export async function adjustInventory(input: InventoryAdjustInput, userId: string) {
  const exists = await prisma.productVariant.findUnique({ where: { id: input.variantId }, select: { id: true } });
  if (!exists) throw notFound(ERROR_MESSAGES.variant.notFound(input.variantId));
  const reason = [input.reason, input.note].filter(Boolean).join(" — ") || null;
  const type = input.type ?? (input.setTo !== undefined ? "CORRECTION" : (input.change ?? 0) > 0 ? "RESTOCK" : "ADJUSTMENT");

  const movementId = await prisma.$transaction(async (tx) => {
    const result =
      input.setTo !== undefined
        ? await setStock(tx, { variantId: input.variantId, stock: input.setTo, type, reason, userId })
        : await moveStock(tx, { variantId: input.variantId, quantity: input.change ?? 0, type, reason, userId });
    return result?.movementId ?? null;
  });

  const [variant, movement] = await Promise.all([
    prisma.productVariant.findUniqueOrThrow({ where: { id: input.variantId }, select: inventoryVariantSelect }),
    movementId ? prisma.stockMovement.findUnique({ where: { id: movementId }, select: movementSelect }) : null,
  ]);
  return { variant: toInventoryRow(variant), movement: movement ? toMovement(movement) : null };
}

export async function listMovements(query: MovementListQuery) {
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const where: Prisma.StockMovementWhereInput = {
    ...(query.variantId ? { variantId: query.variantId } : {}),
    ...(query.productId ? { variant: { productId: query.productId } } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.from || query.to ? { createdAt: { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: query.to } : {}) } } : {}),
  };
  const [rows, total] = await Promise.all([
    prisma.stockMovement.findMany({ where, select: movementSelect, orderBy: { createdAt: "desc" }, skip, take }),
    prisma.stockMovement.count({ where }),
  ]);
  return { data: rows.map(toMovement), meta: buildPaginationMeta({ page, limit, total }) };
}

/** Dashboard alert card: lowest stock first, plus counts. */
export async function lowStockReport(limit: number) {
  const lowWhere = { AND: [sellableVariantWhere, lowStockWhere()] };
  const [rows, lowStock, outOfStock] = await Promise.all([
    prisma.productVariant.findMany({ where: lowWhere, select: inventoryVariantSelect, orderBy: [{ stock: "asc" }, { sku: "asc" }], take: limit }),
    prisma.productVariant.count({ where: lowWhere }),
    prisma.productVariant.count({ where: { AND: [sellableVariantWhere, { stock: { lte: 0 } }] } }),
  ]);
  return { data: rows.map(toInventoryRow), lowStock, outOfStock };
}
