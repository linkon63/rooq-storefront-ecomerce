import { mediaSrc } from "@/utils/media-url";
import { toImage, type ImageResponse, type MediaImageRow } from "./content-image";

/** Row produced by `newsSelect` (lib/server/news/service.ts). */
export type NewsRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  coverMediaId: string | null;
  coverMedia: MediaImageRow | null;
  createdAt: Date;
  updatedAt: Date;
};

export type NewsResponse = Omit<NewsRow, "coverMedia"> & {
  /** Old string field the UI reads — "/api/v1/media/<id>". */
  coverImageUrl: string | null;
  coverImage: ImageResponse | null;
};

export function toNewsResponse({ coverMedia, ...row }: NewsRow): NewsResponse {
  return { ...row, coverImageUrl: mediaSrc(coverMedia), coverImage: toImage(coverMedia) };
}

/**
 * publishedAt bookkeeping from the old service: first publish stamps the
 * date, re-publishing keeps the original, un-publishing clears it.
 */
export function nextPublishedAt(
  existing: { isPublished: boolean; publishedAt: Date | null },
  isPublished: boolean | undefined,
  now: Date,
): Date | null | undefined {
  if (isPublished === undefined) return undefined;
  if (!isPublished) return null;
  if (existing.isPublished) return undefined;
  return existing.publishedAt ?? now;
}
