import { ALLOWED_IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants/media";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** Why a picked file cannot be uploaded, or null when it is fine (mirrors the server checks). */
export function imageFileProblem(file: { size: number; type: string }): string | null {
  if (file.size > MAX_UPLOAD_BYTES) return ERROR_MESSAGES.upload.tooLarge(MAX_UPLOAD_MB);
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type)) return ERROR_MESSAGES.upload.unsupportedType(ALLOWED_IMAGE_MIME_TYPES.join(", "));
  return null;
}
