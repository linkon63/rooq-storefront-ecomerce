import type { PublicGalleryEntry } from "@/types/gallery";

/** Mean star rating of the given entries, or 0 when there are none. */
export function averageGalleryRating(entries: readonly PublicGalleryEntry[]): number {
  if (entries.length === 0) return 0;
  return entries.reduce((sum, entry) => sum + entry.rating, 0) / entries.length;
}
