import { mediaSrc, type MediaRef } from "@/utils/media-url";

type MediaRow = MediaRef & { alt: string | null; width: number | null; height: number | null };

export type HeroMobileRow = {
  id: string;
  position: number;
  mediaId: string | null;
  media: MediaRow | null;
  product: { id: string; name: string; slug: string; status: string; media: { mediaId: string; media: MediaRow }[] };
};

export type HeroMobilePhoto = { id: string; url: string; alt: string | null; width: number | null; height: number | null };

/** One phone-hero pick: the product, the chosen photo (null = main image) and the product's photos to choose from. */
export type HeroMobileResponse = {
  id: string;
  position: number;
  product: { id: string; name: string; slug: string; status: string };
  photo: HeroMobilePhoto | null;
  photos: HeroMobilePhoto[];
};

function toPhoto(media: MediaRow): HeroMobilePhoto {
  return { id: media.id, url: mediaSrc(media) ?? "", alt: media.alt, width: media.width, height: media.height };
}

export function toHeroMobileResponse(row: HeroMobileRow): HeroMobileResponse {
  const { media: gallery, ...product } = row.product;
  return {
    id: row.id,
    position: row.position,
    product,
    photo: row.media ? toPhoto(row.media) : null,
    photos: gallery.map((item) => toPhoto(item.media)),
  };
}
