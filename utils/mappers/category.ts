import { mediaSrc } from "@/utils/media-url";
import type { MediaRow } from "./catalog-refs";

export type CategoryRow = {
  id: string; name: string; slug: string; description: string | null; sortOrder: number; isActive: boolean; isComingSoon: boolean;
  metaTitle: string | null; metaDescription: string | null; parentId: string | null; sizeChartId: string | null;
  imageMediaId: string | null; imageMedia: MediaRow | null; createdAt: Date; updatedAt: Date;
  _count?: { products: number; children: number };
  children?: CategoryRow[];
};

export type CategoryResponse = Omit<CategoryRow, "imageMedia" | "_count" | "children"> & {
  imageUrl: string | null;
  productCount?: number;
  childCount?: number;
  children?: CategoryResponse[];
};

/** The old category body (imageUrl string) plus fashion fields; children recurse. */
export function toCategoryResponse(row: CategoryRow): CategoryResponse {
  const { imageMedia, _count, children, ...rest } = row;
  return {
    ...rest,
    imageUrl: mediaSrc(imageMedia),
    ...(_count ? { productCount: _count.products, childCount: _count.children } : {}),
    ...(children ? { children: children.map(toCategoryResponse) } : {}),
  };
}
