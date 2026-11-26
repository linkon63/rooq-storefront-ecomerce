import { API_PREFIX } from "@/lib/constants/storefront";

export const reelVideoUrl = (id: string) => `${API_PREFIX}/reels/${id}/video`;

/** MP4 files carry an `ftyp` box right after the first four bytes. */
export function isMp4(bytes: Uint8Array): boolean {
  return bytes.length > 12 && String.fromCharCode(...bytes.subarray(4, 8)) === "ftyp";
}

/**
 * The byte range a `Range` header asks for (inclusive), `null` to send the whole
 * file, or `"invalid"` when it starts past the end. Browsers need ranges to play video.
 */
export function parseByteRange(header: string | null, size: number): { start: number; end: number } | "invalid" | null {
  const match = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start > end || start >= size ? "invalid" : { start, end };
}
