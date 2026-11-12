import { MEDIA_ROUTE_PREFIX } from "@/lib/constants/media";

/** Minimal media shape needed to build a src — matches `mediaRefSelect`. */
export type MediaRef = {
  id: string;
  provider: "DATABASE" | "EXTERNAL";
  externalUrl: string | null;
};

/** Public URL of a database-stored media row: "/api/v1/media/<id>". */
export function mediaUrl(id: string): string {
  return `${MEDIA_ROUTE_PREFIX}/${id}`;
}

/** src for any media row — our route for DATABASE, the URL itself for EXTERNAL. */
export function mediaSrc(media: MediaRef | null | undefined): string | null {
  if (!media) return null;
  if (media.provider === "EXTERNAL") return media.externalUrl;
  return mediaUrl(media.id);
}

/** Pulls the media id out of "/api/v1/media/<id>" (or a full URL ending in it). */
export function mediaIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const index = url.indexOf(`${MEDIA_ROUTE_PREFIX}/`);
  if (index === -1) return null;
  const id = url.slice(index + MEDIA_ROUTE_PREFIX.length + 1).split(/[?#/]/)[0];
  return id || null;
}

/** Strong ETag value for a checksum. */
export function etagFor(checksum: string): string {
  return `"${checksum}"`;
}

/** True when an If-None-Match header already names this ETag. */
export function etagMatches(ifNoneMatch: string | null, etag: string): boolean {
  if (!ifNoneMatch) return false;
  return ifNoneMatch
    .split(",")
    .map((value) => value.trim().replace(/^W\//, ""))
    .some((value) => value === etag || value === "*");
}
