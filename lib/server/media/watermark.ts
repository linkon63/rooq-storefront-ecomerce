import "server-only";
import path from "node:path";
import sharp from "sharp";
import { MEDIA_RESIZE_QUALITY, WATERMARK } from "@/lib/constants/media";

const LOGO = path.join(process.cwd(), "public", "images", "logo-kechi-clear.png");

/** The logo, `width` px wide, at full strength on a rounded white badge (readable on dark and busy photos). */
async function watermarkBadge(width: number) {
  const logo = await sharp(LOGO).trim().resize({ width }).png().toBuffer({ resolveWithObject: true });
  const padding = Math.round(width * WATERMARK.paddingRatio);
  const radius = Math.round(width * WATERMARK.radiusRatio);
  const size = { width: logo.info.width + padding * 2, height: logo.info.height + padding * 2 };
  const plate = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}"><rect width="100%" height="100%" rx="${radius}" fill="#fff" fill-opacity="${WATERMARK.badgeOpacity}"/></svg>`,
  );
  const { data, info } = await sharp(plate)
    .composite([{ input: logo.data, left: padding, top: padding }])
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

/**
 * A product photo (optionally scaled down to `width`) as WebP with the ROOQ
 * logo badge in its bottom-right corner. The stored original is never changed.
 * Thumbnails too small to carry a readable mark are only resized.
 */
export async function watermarkMedia(data: Uint8Array, width: number | null): Promise<Uint8Array<ArrayBuffer>> {
  const base = await sharp(data)
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const image = sharp(base.data, { raw: base.info });
  if (base.info.width >= WATERMARK.minImageWidth) {
    const badge = await watermarkBadge(Math.round(base.info.width * WATERMARK.widthRatio));
    const margin = Math.round(base.info.width * WATERMARK.marginRatio);
    image.composite([
      {
        input: badge.data,
        raw: badge.info,
        left: base.info.width - badge.info.width - margin,
        top: Math.max(0, base.info.height - badge.info.height - margin),
      },
    ]);
  }
  const output = await image.webp({ quality: width ? MEDIA_RESIZE_QUALITY : WATERMARK.fullQuality, smartSubsample: true }).toBuffer();
  const bytes = new Uint8Array(output.byteLength);
  bytes.set(output);
  return bytes;
}
