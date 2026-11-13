import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { forbidden } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { buildPaginationMeta, pageWindow, type PaginationMeta } from "@/utils/pagination";
import { toProductCard, toProductCardAdmin, type ProductCard, type ProductCardAdmin } from "@/utils/mappers/product-card";
import type { ProductFacets } from "@/utils/mappers/product-facets";
import { visibleNodes } from "@/utils/catalog/category-tree";
import { loadCategoryNodes } from "../categories/nodes";
import { productCardSelect } from "../selects";
import { buildProductFilters, orderByFor, whereFor } from "./filters";
import { productFacets } from "./facets";
import type { ProductListQuery } from "./list-schema";

export type ProductListResult = {
  data: (ProductCard | ProductCardAdmin)[];
  meta: PaginationMeta;
  facets?: ProductFacets;
};

/** GET /products — shop listing (or the admin catalogue with scope=admin). */
export async function listProducts(query: ProductListQuery, viewer: { isStaff: boolean }): Promise<ProductListResult> {
  const admin = query.scope === "admin";
  if (admin && !viewer.isStaff) throw forbidden(ERROR_MESSAGES.auth.insufficientRole);

  const now = new Date();
  const { page, limit, skip, take } = pageWindow(query.page, query.limit);
  const categories = await loadCategoryNodes();
  const filters = buildProductFilters(query, { now, admin, categories });
  const where = whereFor(filters);
  const wantFacets = query.facets ?? !admin;

  const [rows, total, facets] = await Promise.all([
    prisma.product.findMany({ where, select: productCardSelect(now), orderBy: orderByFor(query.sort, admin), skip, take }),
    prisma.product.count({ where }),
    // Shoppers never see a switched-off category in the filters.
    wantFacets ? productFacets(filters, admin ? categories : visibleNodes(categories)) : Promise.resolve(undefined),
  ]);

  return {
    data: rows.map((row) => (admin ? toProductCardAdmin(row, now) : toProductCard(row, now))),
    meta: buildPaginationMeta({ page, limit, total }),
    ...(facets ? { facets } : {}),
  };
}

/** Shop-visible cards for an arbitrary where (collections, related, looks). Keeps `ids` order when given. */
export async function findProductCards(
  where: Prisma.ProductWhereInput,
  options: { take?: number; skip?: number; orderBy?: Prisma.ProductOrderByWithRelationInput[]; orderIds?: string[] } = {},
): Promise<ProductCard[]> {
  const now = new Date();
  const rows = await prisma.product.findMany({
    where: { AND: [{ status: "active", archivedAt: null }, where] },
    select: productCardSelect(now),
    orderBy: options.orderBy ?? [{ soldCount: "desc" }, { id: "desc" }],
    skip: options.skip,
    take: options.take,
  });
  const cards = rows.map((row) => toProductCard(row, now));
  if (!options.orderIds) return cards;
  const rank = new Map(options.orderIds.map((id, index) => [id, index]));
  return cards.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}
