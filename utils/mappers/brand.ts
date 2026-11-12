import { mediaSrc } from "@/utils/media-url";
import type { MediaRow } from "./catalog-refs";

export type BrandRow = {
  id: string; name: string; slug: string; description: string | null; isActive: boolean; logoMediaId: string | null;
  logoMedia: MediaRow | null; createdAt: Date; updatedAt: Date; _count: { products: number };
};

export function toBrandResponse(row: BrandRow) {
  const { logoMedia, _count, ...rest } = row;
  return { ...rest, logoUrl: mediaSrc(logoMedia), productCount: _count.products };
}

export type BrandResponse = ReturnType<typeof toBrandResponse>;
