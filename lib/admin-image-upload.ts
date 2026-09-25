import { toast } from "sonner";

// Largest image the admin panel lets through to the upload endpoints.
export const MAX_IMAGE_BYTES = 1024 * 1024;
export const MAX_IMAGE_LABEL = "1 MB";
export const IMAGE_SIZE_HINT = `Max ${MAX_IMAGE_LABEL} per image`;

function formatSize(bytes: number): string {
  // Round up so a file just over the limit never reads as exactly the limit.
  if (bytes >= 1024 * 1024) return `${(Math.ceil((bytes / (1024 * 1024)) * 10) / 10).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

/**
 * Reads the files picked in an image input, drops any over the size limit and tells the
 * admin which ones were rejected. Returns the images that fit, or `null` when every picked
 * image was too large — callers should then keep their current selection untouched.
 */
export function pickImages(input: HTMLInputElement): File[] | null {
  const picked = input.files ? Array.from(input.files) : [];
  const tooLarge = picked.filter((file) => file.size > MAX_IMAGE_BYTES);
  if (tooLarge.length === 0) return picked;

  if (tooLarge.length === 1) {
    const [file] = tooLarge;
    toast.error(`Image too large — max ${MAX_IMAGE_LABEL}`, {
      description: `"${file.name}" is ${formatSize(file.size)}. Please compress or resize it and try again.`,
      duration: 6000,
    });
  } else {
    const names = tooLarge.map((file) => `"${file.name}" (${formatSize(file.size)})`).join(", ");
    toast.error(`${tooLarge.length} images too large — max ${MAX_IMAGE_LABEL} each`, {
      description: `Not added: ${names}. Please compress or resize them and try again.`,
      duration: 6000,
    });
  }

  // Clear the input so it doesn't show a rejected file and the same file can be re-picked.
  input.value = "";
  const accepted = picked.filter((file) => file.size <= MAX_IMAGE_BYTES);
  return accepted.length > 0 ? accepted : null;
}
