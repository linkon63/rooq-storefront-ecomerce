import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";

/**
 * Prisma selects shared by the catalog services. Media is always selected
 * through `mediaRefSelect` — never the blob.
 */

export type Tx = Prisma.TransactionClient;

export const colorRefSelect = { id: true, slug: true, name: true, hex: true } as const;
export const sizeRefSelect = { id: true, slug: true, label: true, sizeGroup: true, sortOrder: true } as const;
export const namedRefSelect = { id: true, slug: true, name: true } as const;

/** Active, date-valid product discounts (status + open-ended window). */
export function activeDiscountWhere(now: Date): Prisma.ProductDiscountWhereInput {
  return {
    status: "active",
    AND: [
      { OR: [{ startDate: null }, { startDate: { lte: now } }] },
      { OR: [{ endDate: null }, { endDate: { gte: now } }] },
    ],
  };
}

export const variantAdminSelect = {
  id: true,
  sku: true,
  barcode: true,
  colorId: true,
  sizeId: true,
  price: true,
  compareAtPrice: true,
  costPrice: true,
  stock: true,
  lowStockThreshold: true,
  isDefault: true,
  isActive: true,
  position: true,
  color: { select: colorRefSelect },
  size: { select: sizeRefSelect },
} as const satisfies Prisma.ProductVariantSelect;

export const variantOrderBy = [{ position: "asc" }, { createdAt: "asc" }] as const satisfies Prisma.ProductVariantOrderByWithRelationInput[];

/** Everything a ProductCard needs, in one query (Prisma batches the relations). */
export function productCardSelect(now: Date) {
  return {
    id: true,
    slug: true,
    name: true,
    styleCode: true,
    status: true,
    department: true,
    price: true,
    compareAtPrice: true,
    ratingAvg: true,
    ratingCount: true,
    isFeatured: true,
    publishedAt: true,
    archivedAt: true,
    createdAt: true,
    updatedAt: true,
    brand: { select: namedRefSelect },
    category: { select: namedRefSelect },
    tags: { select: { name: true, slug: true } },
    media: {
      select: { colorId: true, position: true, isPrimary: true, media: { select: mediaRefSelect } },
      orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
    },
    variants: {
      select: {
        id: true,
        colorId: true,
        sizeId: true,
        stock: true,
        lowStockThreshold: true,
        isDefault: true,
        isActive: true,
        position: true,
        color: { select: colorRefSelect },
        size: { select: sizeRefSelect },
      },
      orderBy: variantOrderBy,
    },
    discounts: {
      where: { discount: activeDiscountWhere(now) },
      select: { discount: { select: { id: true, type: true, value: true } } },
    },
  } as const satisfies Prisma.ProductSelect;
}

export type ProductCardRow = Prisma.ProductGetPayload<{ select: ReturnType<typeof productCardSelect> }>;
