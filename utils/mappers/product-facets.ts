import type { Department, Fit } from "@/lib/generated/prisma/enums";
import { compareSizes } from "@/utils/catalog/sizes";
import { toNumOrNull, type ColorRef, type DecimalLike, type NamedRef, type SizeRef } from "./catalog-refs";

export type ProductFacets = {
  departments: { value: Department; count: number }[];
  categories: (NamedRef & { count: number })[];
  sizes: (SizeRef & { count: number })[];
  colors: (ColorRef & { family: string | null; count: number })[];
  brands: (NamedRef & { count: number })[];
  fits: { value: Fit; count: number }[];
  materials: { value: string; count: number }[];
  price: { min: number; max: number };
};

/** groupBy(by: [axisId, productId]) rows → distinct product count per axis id. */
export function countDistinctProducts<K extends string>(rows: readonly ({ productId: string } & Record<K, string>)[], key: K): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row[key], (counts.get(row[key]) ?? 0) + 1);
  return counts;
}

/** Attach counts to master rows, dropping zero-count values; sorted by count desc unless `keepOrder`. */
export function withCounts<T extends { id: string }>(masters: readonly T[], counts: Map<string, number>, keepOrder = false): (T & { count: number })[] {
  const out = masters.flatMap((row) => {
    const count = counts.get(row.id) ?? 0;
    return count > 0 ? [{ ...row, count }] : [];
  });
  return keepOrder ? out : out.sort((a, b) => b.count - a.count);
}

export function sizeFacet(masters: readonly SizeRef[], counts: Map<string, number>): ProductFacets["sizes"] {
  return withCounts(masters, counts, true).sort(compareSizes);
}

export function valueFacet<V extends string>(rows: readonly { value: V | null; count: number }[]): { value: V; count: number }[] {
  return rows
    .filter((row): row is { value: V; count: number } => row.value !== null && row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function priceFacet(min: DecimalLike | null, max: DecimalLike | null): ProductFacets["price"] {
  return { min: toNumOrNull(min) ?? 0, max: toNumOrNull(max) ?? 0 };
}
