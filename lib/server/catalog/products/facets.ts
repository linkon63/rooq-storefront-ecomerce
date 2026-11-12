import "server-only";
import { prisma } from "@/lib/server/prisma";
import type { CategoryNode } from "@/utils/catalog/category-tree";
import {
  countDistinctProducts,
  priceFacet,
  sizeFacet,
  valueFacet,
  withCounts,
  type ProductFacets,
} from "@/utils/mappers/product-facets";
import { colorRefSelect, namedRefSelect, sizeRefSelect } from "../selects";
import { whereFor, type ProductFilters } from "./filters";

/**
 * Disjunctive facet counts: each facet applies every other active filter but
 * not its own, so picking size M still shows what L would add. All queries run
 * in parallel; size/colour count distinct products via groupBy(axis, product).
 */
export async function productFacets(filters: ProductFilters, categories: CategoryNode[]): Promise<ProductFacets> {
  const [departments, categoryGroups, sizeRows, colorRows, brandGroups, fits, materials, price] = await Promise.all([
    prisma.product.groupBy({ by: ["department"], where: whereFor(filters, "department"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["categoryId"], where: whereFor(filters, "category"), _count: { _all: true } }),
    prisma.productVariant.groupBy({
      by: ["sizeId", "productId"],
      where: { isActive: true, stock: { gt: 0 }, product: whereFor(filters, "size") },
    }),
    prisma.productVariant.groupBy({
      by: ["colorId", "productId"],
      where: { isActive: true, product: whereFor(filters, "color") },
    }),
    prisma.product.groupBy({ by: ["brandId"], where: whereFor(filters, "brand"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["fit"], where: whereFor(filters, "fit"), _count: { _all: true } }),
    prisma.product.groupBy({ by: ["material"], where: whereFor(filters, "material"), _count: { _all: true } }),
    prisma.product.aggregate({ where: whereFor(filters, "price"), _min: { price: true }, _max: { price: true } }),
  ]);

  const sizeCounts = countDistinctProducts(sizeRows, "sizeId");
  const colorCounts = countDistinctProducts(colorRows, "colorId");
  const brandCounts = new Map(brandGroups.map((g) => [g.brandId, g._count._all]));
  const categoryCounts = new Map(categoryGroups.map((g) => [g.categoryId, g._count._all]));

  const [sizes, colors, brands] = await Promise.all([
    prisma.size.findMany({ where: { id: { in: [...sizeCounts.keys()] } }, select: sizeRefSelect }),
    prisma.color.findMany({
      where: { id: { in: [...colorCounts.keys()] } },
      select: { ...colorRefSelect, family: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.brand.findMany({ where: { id: { in: [...brandCounts.keys()] } }, select: namedRefSelect }),
  ]);

  return {
    departments: valueFacet(departments.map((g) => ({ value: g.department, count: g._count._all }))),
    categories: withCounts(
      categories.map(({ id, slug, name }) => ({ id, slug, name })),
      categoryCounts,
    ),
    sizes: sizeFacet(sizes, sizeCounts),
    colors: withCounts(colors, colorCounts, true),
    brands: withCounts(brands, brandCounts),
    fits: valueFacet(fits.map((g) => ({ value: g.fit, count: g._count._all }))),
    materials: valueFacet(materials.map((g) => ({ value: g.material, count: g._count._all }))),
    price: priceFacet(price._min.price, price._max.price),
  };
}
