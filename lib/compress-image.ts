import { IMAGE_MAX_EDGE_PX } from "@/lib/constants/media";

/** Files at or under this size that already fit the edge cap go up untouched. */
const SKIP_BELOW_BYTES = 1024 * 1024;
const WEBP_QUALITY = 0.85;

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/webp", WEBP_QUALITY));
}

/**
 * Shrinks a picked image in the browser before upload: long edge capped at
 * 1600 px (the size the server stores anyway), re-encoded as WebP. Keeps
 * uploads small and well under the host's request-body limit (4.5 MB on
 * Vercel). GIFs (may be animated) and files the browser cannot decode are sent
 * as they are; the server still checks and re-encodes everything.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, IMAGE_MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size >= file.size) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp", lastModified: file.lastModified });
  } catch {
    return file;
  }
}

/** A copy of `form` with every image file passed through compressImage(). */
export async function compressFormImages(form: FormData): Promise<FormData> {
  const next = new FormData();
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") next.append(key, value);
    else {
      const file = await compressImage(value);
      next.append(key, file, file.name);
    }
  }
  return next;
}
