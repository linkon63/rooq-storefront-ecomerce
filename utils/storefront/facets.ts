import { SIZE_GROUP_ORDER } from "@/lib/constants/catalog";
import type { ProductFacets, SizeGroup } from "@/types/storefront/catalog";

/** Sizes grouped by system (letters, numbers, shoes), each group in sort order. */
export function groupSizes(sizes: ProductFacets["sizes"]): [SizeGroup, ProductFacets["sizes"]][] {
  const groups = new Map<SizeGroup, ProductFacets["sizes"]>();
  const sorted = [...sizes].sort(
    (a, b) => SIZE_GROUP_ORDER[a.sizeGroup] - SIZE_GROUP_ORDER[b.sizeGroup] || a.sortOrder - b.sortOrder,
  );
  for (const size of sorted) groups.set(size.sizeGroup, [...(groups.get(size.sizeGroup) ?? []), size]);
  return [...groups.entries()];
}

/** Lookup for active-filter chips: slug/value → label. */
export function facetLabels(facets: ProductFacets | null): Map<string, string> {
  const labels = new Map<string, string>();
  if (!facets) return labels;
  for (const entry of facets.categories) labels.set(`category:${entry.slug}`, entry.name);
  for (const entry of facets.sizes) labels.set(`size:${entry.slug}`, `Size ${entry.label}`);
  for (const entry of facets.colors) labels.set(`color:${entry.slug}`, entry.name);
  for (const entry of facets.brands) labels.set(`brand:${entry.slug}`, entry.name);
  return labels;
}
