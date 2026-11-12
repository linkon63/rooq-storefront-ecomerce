import type { Department } from "@/lib/generated/prisma/enums";
import { chartColumns } from "@/utils/catalog/size-chart";
import { compareSizes } from "@/utils/catalog/sizes";
import { toNum, type DecimalLike, type NamedRef, type SizeRef } from "./catalog-refs";

export type SizeChartRowSource = {
  sizeId: string;
  position: number;
  size: SizeRef;
  measurements: { label: string; valueCm: DecimalLike; position: number }[];
};

export type SizeChartSource = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  howToMeasure: string | null;
  department: Department | null;
  isActive: boolean;
  rows: SizeChartRowSource[];
  categories?: NamedRef[];
  _count?: { products: number };
};

export type SizeChart = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  howToMeasure: string | null;
  department: Department | null;
  isActive: boolean;
  columns: string[];
  rows: { sizeId: string; sizeLabel: string; position: number; values: Record<string, number> }[];
  categories?: NamedRef[];
  productCount?: number;
};

export function toSizeChart(row: SizeChartSource): SizeChart {
  const rows = [...row.rows].sort((a, b) => a.position - b.position || compareSizes(a.size, b.size));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    howToMeasure: row.howToMeasure,
    department: row.department,
    isActive: row.isActive,
    columns: chartColumns(rows),
    rows: rows.map((r) => ({
      sizeId: r.sizeId,
      sizeLabel: r.size.label,
      position: r.position,
      values: Object.fromEntries(r.measurements.map((m) => [m.label, toNum(m.valueCm)])),
    })),
    ...(row.categories ? { categories: row.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })) } : {}),
    ...(row._count ? { productCount: row._count.products } : {}),
  };
}
