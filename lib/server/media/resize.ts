import "server-only";
import sharp from "sharp";
import { MEDIA_RESIZE_QUALITY } from "@/lib/constants/media";

/**
 * Scales a stored image down to `width` (never up) as WebP. Used by the media
 * route for srcset widths; the CDN caches each width forever, so this runs
 * once per image and width.
 */
export async function resizeMedia(data: Uint8Array, width: number): Promise<Uint8Array<ArrayBuffer>> {
  const output = await sharp(data, { animated: true })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: MEDIA_RESIZE_QUALITY })
    .toBuffer();
  const bytes = new Uint8Array(output.byteLength);
  bytes.set(output);
  return bytes;
}
