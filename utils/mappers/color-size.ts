import type { SizeGroup } from "@/lib/generated/prisma/enums";

export type ColorRow = {
  id: string; slug: string; name: string; hex: string; family: string | null; sortOrder: number; isActive: boolean;
  createdAt: Date; updatedAt: Date; _count: { variants: number };
};
export type SizeRow = {
  id: string; slug: string; label: string; sizeGroup: SizeGroup; sortOrder: number; isActive: boolean;
  createdAt: Date; updatedAt: Date; _count: { variants: number; sizeChartRows: number };
};

export function toColorResponse(row: ColorRow) {
  const { _count, ...rest } = row;
  return { ...rest, variantCount: _count.variants };
}

export function toSizeResponse(row: SizeRow) {
  const { _count, ...rest } = row;
  return { ...rest, variantCount: _count.variants, sizeChartCount: _count.sizeChartRows };
}

export type ColorResponse = ReturnType<typeof toColorResponse>;
export type SizeResponse = ReturnType<typeof toSizeResponse>;
