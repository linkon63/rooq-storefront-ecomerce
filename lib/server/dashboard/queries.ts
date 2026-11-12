import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "../prisma";
import { mediaRefSelect } from "../media/select";

/** Active, sellable variants at or under their own low-stock threshold. */
export function lowStockWhere(): Prisma.ProductVariantWhereInput {
  return {
    isActive: true,
    stock: { lte: prisma.productVariant.fields.lowStockThreshold },
    product: { archivedAt: null },
  };
}

export const lowStockVariantSelect = {
  id: true,
  sku: true,
  stock: true,
  lowStockThreshold: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      media: {
        select: { media: { select: mediaRefSelect } },
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        take: 1,
      },
    },
  },
  color: { select: { name: true, hex: true } },
  size: { select: { label: true } },
} as const satisfies Prisma.ProductVariantSelect;

/** Lowest stock first — what needs reordering most urgently. */
export function findLowStockVariants(take: number) {
  return prisma.productVariant.findMany({
    where: lowStockWhere(),
    select: lowStockVariantSelect,
    orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
    take,
  });
}

/** Primary image of each product, for top-product cards. */
export const primaryImageSelect = {
  select: { media: { select: mediaRefSelect } },
  orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
  take: 1,
} satisfies Prisma.Product$mediaArgs;
