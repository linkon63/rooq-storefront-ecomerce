"use client";

import { catalogApi } from "@/lib/admin-api/catalog";
import type { Attribute, Tag, Unit } from "@/types/admin/catalog";
import { flattenCategoryTree, type CategoryOption } from "@/utils/catalog/category-options";
import type { AdminBrand, AdminCollection, AdminColor, AdminSize, AdminSizeChart } from "@/types/catalog-admin";

export type ProductLookups = {
  categories: CategoryOption[];
  brands: AdminBrand[];
  tags: Tag[];
  units: Unit[];
  suppliers: { id: string; name: string; isActive: boolean }[];
  attributes: Attribute[];
  sizeCharts: AdminSizeChart[];
  collections: AdminCollection[];
  colors: AdminColor[];
  sizes: AdminSize[];
};

/** Every master the editor picks from, fetched in parallel. */
export async function loadProductLookups(): Promise<ProductLookups> {
  const [tree, brands, tags, units, suppliers, attributes, sizeCharts, collections, colors, sizes] = await Promise.all([
    catalogApi.lookups.categories(),
    catalogApi.lookups.brands(),
    catalogApi.lookups.tags(),
    catalogApi.lookups.units(),
    catalogApi.lookups.suppliers(),
    catalogApi.lookups.attributes(),
    catalogApi.sizeCharts.list(),
    catalogApi.collections.list(),
    catalogApi.colors.list(),
    catalogApi.sizes.list(),
  ]);
  return { categories: flattenCategoryTree(tree), brands, tags, units, suppliers, attributes, sizeCharts, collections, colors, sizes };
}
