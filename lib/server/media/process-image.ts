import "server-only";
import sharp from "sharp";
import { IMAGE_MAX_EDGE_PX, IMAGE_WEBP_QUALITY, STORED_IMAGE_MIME } from "@/lib/constants/media";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest } from "../http-error";

export type ProcessedImage = {
  buffer: Buffer;
  width: number;
  height: number;
  sizeBytes: number;
  mimeType: string;
};

/**
 * Normalises any accepted image to WebP: honours EXIF rotation, caps the long
 * edge at 1600 px (never enlarges), quality 80, strips metadata.
 */
export async function processImage(input: Buffer | Uint8Array): Promise<ProcessedImage> {
  try {
    const { data, info } = await sharp(input, { failOn: "error" })
      .rotate()
      .resize({
        width: IMAGE_MAX_EDGE_PX,
        height: IMAGE_MAX_EDGE_PX,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_WEBP_QUALITY })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, width: info.width, height: info.height, sizeBytes: info.size, mimeType: STORED_IMAGE_MIME };
  } catch {
    throw badRequest(ERROR_MESSAGES.media.invalidImage);
  }
}
