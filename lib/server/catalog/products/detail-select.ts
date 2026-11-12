import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { mediaRefSelect } from "@/lib/server/media/select";
import { activeDiscountWhere, namedRefSelect, variantAdminSelect, variantOrderBy } from "../selects";

export function productDetailSelect(now: Date, includeInactiveVariants: boolean) {
  return {
    id: true, slug: true, name: true, styleCode: true, shortDescription: true, description: true,
    status: true, isFeatured: true, price: true, compareAtPrice: true, costPrice: true,
    department: true, material: true, composition: true, careInstructions: true,
    fit: true, season: true, occasions: true, pattern: true, modelInfo: true, features: true,
    metaTitle: true, metaDescription: true, metaKeywords: true,
    ratingAvg: true, ratingCount: true, soldCount: true,
    brandId: true, categoryId: true, unitId: true, supplierId: true, sizeChartId: true,
    publishedAt: true, archivedAt: true, createdAt: true, updatedAt: true,
    brand: { select: { ...namedRefSelect, logoMedia: { select: mediaRefSelect } } },
    category: { select: namedRefSelect },
    unit: { select: { id: true, name: true, code: true } },
    supplier: { select: { id: true, name: true } },
    tags: { select: { id: true, slug: true, name: true } },
    collections: {
      select: { collection: { select: { id: true, slug: true, name: true, type: true } } },
      orderBy: { position: "asc" },
    },
    attributeValues: {
      select: { attributeValue: { select: { id: true, value: true, attribute: { select: { id: true, name: true } } } } },
    },
    media: {
      select: { id: true, mediaId: true, colorId: true, position: true, isPrimary: true, media: { select: mediaRefSelect } },
      orderBy: { position: "asc" },
    },
    variants: {
      where: includeInactiveVariants ? {} : { isActive: true },
      select: variantAdminSelect,
      orderBy: variantOrderBy,
    },
    discounts: {
      where: { discount: activeDiscountWhere(now) },
      select: { discount: { select: { id: true, type: true, value: true } } },
    },
  } as const satisfies Prisma.ProductSelect;
}
