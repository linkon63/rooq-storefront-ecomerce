import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { descendantIds, type CategoryNode } from "@/utils/catalog/category-tree";
import { newArrivalsSince } from "@/utils/catalog/dates";
import { activeDiscountWhere } from "../selects";
import type { ProductListQuery } from "./list-schema";

type Where = Prisma.ProductWhereInput;

/** Filters that also have a facet; each facet is counted without its own filter. */
export const FACET_KEYS = ["department", "category", "size", "color", "brand", "fit", "material", "price"] as const;
export type FacetKey = (typeof FACET_KEYS)[number];

export type ProductFilters = {
  /** Visibility + every filter without a facet. */
  base: Where[];
  facet: Partial<Record<FacetKey, Where>>;
};

export type FilterContext = { now: Date; admin: boolean; categories: CategoryNode[] };

const insensitive = (value: string) => ({ contains: value, mode: "insensitive" as const });

/** Slugs (or names, for old links like ?category=Denim+Jackets) → ids incl. descendants. */
export function resolveCategoryIds(nodes: CategoryNode[], values: string[]): string[] {
  const wanted = new Set(values.map((value) => value.toLowerCase()));
  const roots = nodes.filter((node) => wanted.has(node.slug) || wanted.has(node.name.toLowerCase())).map((n) => n.id);
  return descendantIds(nodes, roots);
}

function visibility(query: ProductListQuery, admin: boolean): Where {
  if (!admin) return { status: "active", archivedAt: null };
  return {
    ...(query.includeArchived ? {} : { archivedAt: null }),
    ...(query.status ? { status: query.status } : {}),
  };
}

function searchClause(term: string): Where {
  return {
    OR: [
      { name: insensitive(term) },
      { slug: insensitive(term) },
      { styleCode: insensitive(term) },
      { brand: { name: insensitive(term) } },
      { variants: { some: { sku: insensitive(term) } } },
    ],
  };
}

function onSaleClause(now: Date): Where {
  return {
    OR: [
      { compareAtPrice: { gt: prisma.product.fields.price } },
      { discounts: { some: { discount: activeDiscountWhere(now) } } },
    ],
  };
}

function categoryClause(query: ProductListQuery, nodes: CategoryNode[]): Where | undefined {
  const ids = new Set<string>();
  if (query.category?.length) {
    const resolved = resolveCategoryIds(nodes, query.category);
    // An unknown category matches nothing rather than everything.
    if (!resolved.length) return { id: { in: [] } };
    resolved.forEach((id) => ids.add(id));
  }
  if (query.categoryId) descendantIds(nodes, [query.categoryId]).forEach((id) => ids.add(id));
  return ids.size ? { categoryId: { in: [...ids] } } : undefined;
}

function brandClause(query: ProductListQuery): Where | undefined {
  const or: Where[] = [];
  if (query.brand?.length) or.push({ brand: { slug: { in: query.brand.map((s) => s.toLowerCase()) } } });
  if (query.brandId) or.push({ brandId: query.brandId });
  return or.length ? { OR: or } : undefined;
}

function priceClause(query: ProductListQuery): Where | undefined {
  if (query.minPrice === undefined && query.maxPrice === undefined) return undefined;
  return { price: { ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}) } };
}

export function buildProductFilters(query: ProductListQuery, ctx: FilterContext): ProductFilters {
  const base: Where[] = [visibility(query, ctx.admin)];
  const term = query.search || query.q;
  if (term) base.push(searchClause(term));
  if (query.pattern?.length) base.push({ pattern: { in: query.pattern } });
  if (query.season?.length) base.push({ season: { in: query.season } });
  if (query.occasion?.length) base.push({ occasions: { hasSome: query.occasion } });
  if (query.inStock) base.push({ variants: { some: { isActive: true, stock: { gt: 0 } } } });
  if (query.onSale) base.push(onSaleClause(ctx.now));
  if (query.new) base.push({ publishedAt: { gte: newArrivalsSince(ctx.now) } });
  if (query.featured) base.push({ isFeatured: true });
  if (query.collection) base.push({ collections: { some: { collection: { slug: query.collection } } } });
  if (query.tag) base.push({ tags: { some: { slug: query.tag } } });
  if (query.ids?.length) base.push({ id: { in: query.ids } });

  const facet: ProductFilters["facet"] = {
    department: query.department?.length ? { department: { in: query.department } } : undefined,
    category: categoryClause(query, ctx.categories),
    size: query.size?.length
      ? { variants: { some: { isActive: true, stock: { gt: 0 }, size: { slug: { in: query.size } } } } }
      : undefined,
    color: query.color?.length ? { variants: { some: { isActive: true, color: { slug: { in: query.color } } } } } : undefined,
    brand: brandClause(query),
    fit: query.fit?.length ? { fit: { in: query.fit } } : undefined,
    material: query.material?.length
      ? { OR: query.material.flatMap((m) => [{ material: insensitive(m) }, { composition: insensitive(m) }]) }
      : undefined,
    price: priceClause(query),
  };
  return { base, facet };
}

/** AND of every clause, optionally leaving one facet's own filter out. */
export function whereFor(filters: ProductFilters, exclude?: FacetKey): Where {
  const clauses = [...filters.base];
  for (const key of FACET_KEYS) {
    const clause = filters.facet[key];
    if (clause && key !== exclude) clauses.push(clause);
  }
  return { AND: clauses };
}

export function orderByFor(sort: ProductListQuery["sort"], admin: boolean): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }, { id: "asc" }];
    case "price_desc":
      return [{ price: "desc" }, { id: "desc" }];
    case "popular":
      return [{ soldCount: "desc" }, { id: "desc" }];
    case "rating":
      return [{ ratingAvg: "desc" }, { ratingCount: "desc" }, { id: "desc" }];
    case "newest":
      return [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }, { id: "desc" }];
    default:
      return admin
        ? [{ createdAt: "desc" }, { id: "desc" }]
        : [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }, { id: "desc" }];
  }
}
