import { mediaSrc, type MediaRef } from "@/utils/media-url";

type HeroSlideRow = {
  id: string;
  position: number;
  isActive: boolean;
  productId: string | null;
  media: MediaRef & { alt?: string | null; width?: number | null; height?: number | null };
  product: { id: string; name: string; slug: string; status: string } | null;
};

export type HeroSlideResponse = {
  id: string;
  position: number;
  isActive: boolean;
  image: { id: string; url: string; alt: string | null; width: number | null; height: number | null };
  product: { id: string; name: string; slug: string; status: string } | null;
};

export function toHeroSlideResponse(row: HeroSlideRow): HeroSlideResponse {
  return {
    id: row.id,
    position: row.position,
    isActive: row.isActive,
    image: {
      id: row.media.id,
      url: mediaSrc(row.media) ?? "",
      alt: row.media.alt ?? null,
      width: row.media.width ?? null,
      height: row.media.height ?? null,
    },
    product: row.product,
  };
}
