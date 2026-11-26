import "server-only";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_RESIZE_QUALITY, WATERMARK } from "@/lib/constants/media";

const LOGO = path.join(process.cwd(), "public", "images", "logo-kechi-clear.png");

/** The logo scaled to `width` px with its alpha lowered to the watermark opacity. */
async function watermarkLogo(width: number) {
  const { data, info } = await sharp(LOGO).trim().resize({ width }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let alpha = 3; alpha < data.length; alpha += 4) data[alpha] = Math.round(data[alpha] * WATERMARK.opacity);
  return { data, info };
}

/**
 * A product photo (optionally scaled down to `width`) as WebP with the ROOQ
 * logo in its bottom-right corner. The stored original is never changed.
 * Thumbnails too small to carry a readable mark are only resized.
 */
export async function watermarkMedia(data: Uint8Array, width: number | null): Promise<Uint8Array<ArrayBuffer>> {
  const base = await sharp(data)
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const image = sharp(base.data, { raw: base.info });
  if (base.info.width >= WATERMARK.minImageWidth) {
    const logo = await watermarkLogo(Math.round(base.info.width * WATERMARK.widthRatio));
    const margin = Math.round(base.info.width * WATERMARK.marginRatio);
    image.composite([
      {
        input: logo.data,
        raw: logo.info,
        left: base.info.width - logo.info.width - margin,
        top: Math.max(0, base.info.height - logo.info.height - margin),
      },
    ]);
  }
  const output = await image.webp({ quality: width ? MEDIA_RESIZE_QUALITY : WATERMARK.fullQuality }).toBuffer();
  const bytes = new Uint8Array(output.byteLength);
  bytes.set(output);
  return bytes;
}
