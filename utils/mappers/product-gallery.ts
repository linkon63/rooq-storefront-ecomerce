import { toImage, type Image, type MediaRow } from "./catalog-refs";

export type GalleryRow = { colorId: string | null; position: number; isPrimary: boolean; media: MediaRow };

function byPrimaryThenPosition(a: GalleryRow, b: GalleryRow): number {
  return Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position;
}

/** Images of one colour (primary first), falling back to the shared images. */
export function imagesForColor(gallery: readonly GalleryRow[], colorId: string | null): GalleryRow[] {
  const own = colorId ? gallery.filter((row) => row.colorId === colorId) : [];
  const pool = own.length ? own : gallery.filter((row) => row.colorId === null);
  const fallback = pool.length ? pool : [...gallery];
  return fallback.sort(byPrimaryThenPosition);
}

/** Primary + hover image for a colour. */
export function cardImages(gallery: readonly GalleryRow[], colorId: string | null): { image: Image | null; hoverImage: Image | null } {
  const rows = imagesForColor(gallery, colorId);
  return { image: toImage(rows[0]?.media), hoverImage: toImage(rows[1]?.media) };
}

/** First image that belongs to exactly this colour (swatch thumbnails). */
export function colorSwatchImage(gallery: readonly GalleryRow[], colorId: string): Image | null {
  const own = gallery.filter((row) => row.colorId === colorId).sort(byPrimaryThenPosition);
  return toImage(own[0]?.media);
}
