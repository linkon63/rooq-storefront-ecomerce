import "server-only";
import sharp from "sharp";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MAX_EDGE_PX,
  IMAGE_MIN_WEBP_QUALITY,
  IMAGE_WEBP_QUALITY,
  STORED_IMAGE_MIME,
} from "@/lib/constants/media";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest } from "../http-error";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
};

const QUALITY_STEP = 8;
const EDGE_SHRINK = 0.85;
const MIN_EDGE_PX = 480;

async function encode(input: Buffer | Uint8Array, edge: number, quality: number): Promise<ProcessedImage> {
  const { data, info } = await sharp(input, { failOn: "error" })
    .rotate()
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, sizeBytes: info.size, mimeType: STORED_IMAGE_MIME };
}

/**
 * Normalises any accepted image to WebP: honours EXIF rotation, caps the long
 * edge at 1600 px (never enlarges), strips metadata, and keeps the result under
 * IMAGE_MAX_BYTES — first by lowering quality, then by scaling down.
 */
export async function processImage(input: Buffer | Uint8Array): Promise<ProcessedImage> {
  try {
    let edge = IMAGE_MAX_EDGE_PX;
    let quality = IMAGE_WEBP_QUALITY;
    let image = await encode(input, edge, quality);
    while (image.sizeBytes > IMAGE_MAX_BYTES && edge > MIN_EDGE_PX) {
      if (quality - QUALITY_STEP >= IMAGE_MIN_WEBP_QUALITY) {
        quality -= QUALITY_STEP;
      } else {
        edge = Math.max(MIN_EDGE_PX, Math.round(Math.max(image.width, image.height) * EDGE_SHRINK));
      }
      image = await encode(input, edge, quality);
    }
    return image;
  } catch {
    throw badRequest(ERROR_MESSAGES.media.invalidImage);
  }
}
