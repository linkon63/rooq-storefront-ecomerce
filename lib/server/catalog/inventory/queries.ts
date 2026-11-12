import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";
import { prisma } from "@/lib/server/prisma";
import { colorRefSelect, sizeRefSelect } from "../selects";

export const inventoryVariantSelect = {
  id: true, sku: true, barcode: true, stock: true, lowStockThreshold: true, isActive: true, price: true, colorId: true,
  color: { select: colorRefSelect },
  size: { select: sizeRefSelect },
  product: {
    select: {
      id: true, name: true, slug: true, status: true, price: true,
      media: {
        select: { colorId: true, position: true, isPrimary: true, media: { select: mediaRefSelect } },
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 12,
      },
    },
  },
} as const satisfies Prisma.ProductVariantSelect;

export const movementSelect = {
  id: true, type: true, quantity: true, stockAfter: true, reason: true, createdAt: true,
  variant: { select: { id: true, sku: true, product: { select: { id: true, name: true } }, color: { select: colorRefSelect }, size: { select: sizeRefSelect } } },
  order: { select: { id: true, orderNumber: true } },
  returnRequest: { select: { id: true, requestNumber: true } },
  createdBy: { select: { id: true, name: true } },
} as const satisfies Prisma.StockMovementSelect;

/** 0 < stock <= lowStockThreshold (column-to-column comparison). */
export function lowStockWhere(): Prisma.ProductVariantWhereInput {
  return { stock: { gt: 0, lte: prisma.productVariant.fields.lowStockThreshold } };
}

/** Variants still on sale: active, on a live (not archived) product. */
export const sellableVariantWhere: Prisma.ProductVariantWhereInput = { isActive: true, product: { archivedAt: null } };
