import "server-only";
import { unstable_cache } from "next/cache";
import { ZodError } from "zod";
import { CATALOG_CACHE_TAG, CATALOG_REVALIDATE_SECONDS } from "@/lib/constants/storefront";
import { HttpError } from "@/lib/server/http-error";
import { toPlainJson } from "@/utils/json";

/**
 * Storefront server components call the API services in-process (no HTTP
 * hop, no request origin needed). Every result is round-tripped through JSON
 * so pages receive exactly the documented response shapes
 * (docs/architecture/fashion-api-contract.md), and public catalogue reads are
 * kept in the Next data cache for CATALOG_REVALIDATE_SECONDS — the same
 * freshness the old `fetch(..., { next: { revalidate } })` reads had.
 */

/** Wraps a public read in the data cache; arguments are part of the cache key. */
export function cachedRead<A extends unknown[], R>(name: string, read: (...args: A) => Promise<unknown>) {
  return unstable_cache(async (...args: A): Promise<R> => toPlainJson<R>(await read(...args)), ["storefront", name], {
    revalidate: CATALOG_REVALIDATE_SECONDS,
    tags: [CATALOG_CACHE_TAG],
  });
}

/** Answers `fallback` instead of throwing (chrome, rails, optional blocks). */
export async function readOr<T>(label: string, read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    console.error(`[storefront] ${label} failed`, error instanceof Error ? error.message : error);
    return fallback;
  }
}

/** Answers null when the record does not exist (404) or the key is malformed (400); rethrows anything else. */
export async function readOrNull<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch (error) {
    if (error instanceof ZodError) return null;
    if (error instanceof HttpError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}
