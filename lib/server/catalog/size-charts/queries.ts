import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/server/prisma";
import { toSizeChart, type SizeChart } from "@/utils/mappers/size-chart";
import { namedRefSelect, sizeRefSelect } from "../selects";
import type { CategoryNodeRow } from "../categories/nodes";

export const sizeChartSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  howToMeasure: true,
  department: true,
  isActive: true,
  rows: {
    select: {
      sizeId: true,
      position: true,
      size: { select: sizeRefSelect },
      measurements: { select: { label: true, valueCm: true, position: true }, orderBy: { position: "asc" } },
    },
    orderBy: { position: "asc" },
  },
} as const satisfies Prisma.SizeChartSelect;

export const sizeChartAdminSelect = {
  ...sizeChartSelect,
  categories: { select: namedRefSelect },
  _count: { select: { products: true } },
} as const satisfies Prisma.SizeChartSelect;

/** product → its category → the parent categories (nearest first). */
export function resolveSizeChartId(
  product: { sizeChartId: string | null; categoryId: string },
  categories: readonly CategoryNodeRow[],
): string | null {
  if (product.sizeChartId) return product.sizeChartId;
  const byId = new Map(categories.map((c) => [c.id, c]));
  const seen = new Set<string>();
  let current = byId.get(product.categoryId);
  while (current && !seen.has(current.id)) {
    if (current.sizeChartId) return current.sizeChartId;
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return null;
}

/** An active chart by id (public), or null. */
export async function findActiveSizeChart(id: string | null): Promise<SizeChart | null> {
  if (!id) return null;
  const chart = await prisma.sizeChart.findFirst({ where: { id, isActive: true }, select: sizeChartSelect });
  return chart ? toSizeChart(chart) : null;
}
