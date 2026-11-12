import { mediaSrc, type MediaRef } from "@/utils/media-url";

/** Row shape of `mediaRefSelect` (lib/server/media/select.ts). */
export type MediaImageRow = MediaRef & {
  alt: string | null;
  width: number | null;
  height: number | null;
};

/** The contract's `Image`: `{ id, url, alt, width, height }`. */
export type ImageResponse = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

export function toImage(media: MediaImageRow | null | undefined): ImageResponse | null {
  const url = mediaSrc(media);
  if (!media || !url) return null;
  return { id: media.id, url, alt: media.alt, width: media.width, height: media.height };
}

/** Ordered join rows (`{ position, media }`) → images, skipping unresolvable ones. */
export function toImages(rows: readonly { position: number; media: MediaImageRow }[]): ImageResponse[] {
  return [...rows]
    .sort((a, b) => a.position - b.position)
    .map((row) => toImage(row.media))
    .filter((image): image is ImageResponse => image !== null);
}
