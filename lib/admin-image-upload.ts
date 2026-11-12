import { toast } from "sonner";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/constants/media";
import { formatFileSize } from "@/utils/file-size";

/** Largest image the admin lets through — the API's own limit (it re-encodes to WebP on upload). */
export const MAX_IMAGE_BYTES = MAX_UPLOAD_BYTES;
export const MAX_IMAGE_LABEL = `${MAX_UPLOAD_MB} MB`;
export const IMAGE_SIZE_HINT = `Max ${MAX_IMAGE_LABEL} per image`;

const TOAST_MS = 6000;

/**
 * Reads the files picked in an image input, drops any over the size limit and tells the
 * admin which ones were rejected. Returns the images that fit, or `null` when every picked
 * image was too large — callers should then keep their current selection untouched.
 */
export function pickImages(input: HTMLInputElement): File[] | null {
  const picked = input.files ? Array.from(input.files) : [];
  const tooLarge = picked.filter((file) => file.size > MAX_IMAGE_BYTES);
  if (tooLarge.length === 0) return picked;

  const { upload } = ERROR_MESSAGES;
  if (tooLarge.length === 1) {
    const [file] = tooLarge;
    toast.error(upload.imageTooLarge(MAX_IMAGE_LABEL), {
      description: upload.imageTooLargeDetail(file.name, formatFileSize(file.size)),
      duration: TOAST_MS,
    });
  } else {
    const names = tooLarge.map((file) => `"${file.name}" (${formatFileSize(file.size)})`).join(", ");
    toast.error(upload.imagesTooLarge(tooLarge.length, MAX_IMAGE_LABEL), {
      description: upload.imagesTooLargeDetail(names),
      duration: TOAST_MS,
    });
  }

  // Clear the input so it doesn't show a rejected file and the same file can be re-picked.
  input.value = "";
  const accepted = picked.filter((file) => file.size <= MAX_IMAGE_BYTES);
  return accepted.length > 0 ? accepted : null;
}
