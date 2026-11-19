import "server-only";
import { MEDIA_MEMORY_CACHE_BYTES } from "@/lib/constants/media";
import type { ServableMedia } from "./queries";

/**
 * Per-instance LRU of served image bytes, capped by total size. A Map keeps
 * insertion order, so re-inserting on read moves an entry to the newest end.
 */
const entries = new Map<string, ServableMedia>();
let totalBytes = 0;

export function readMediaCache(id: string): ServableMedia | undefined {
  const hit = entries.get(id);
  if (!hit) return undefined;
  entries.delete(id);
  entries.set(id, hit);
  return hit;
}

export function writeMediaCache(id: string, media: ServableMedia): ServableMedia {
  const size = media.data.byteLength;
  if (size > MEDIA_MEMORY_CACHE_BYTES) return media;
  const previous = entries.get(id);
  if (previous) {
    totalBytes -= previous.data.byteLength;
    entries.delete(id);
  }
  entries.set(id, media);
  totalBytes += size;
  for (const [key, value] of entries) {
    if (totalBytes <= MEDIA_MEMORY_CACHE_BYTES) break;
    entries.delete(key);
    totalBytes -= value.data.byteLength;
  }
  return media;
}

/** Drop an id after its bytes change or the row is deleted. */
export function evictMediaCache(id: string): void {
  const previous = entries.get(id);
  if (!previous) return;
  totalBytes -= previous.data.byteLength;
  entries.delete(id);
}
