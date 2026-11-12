/** Largest upload accepted, before compression. */
export const MAX_UPLOAD_MB = 5;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

/** Image types the upload endpoint accepts (everything is re-encoded to WebP). */
export const ALLOWED_IMAGE_MIME_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

/** Long-edge cap and WebP quality applied by processImage(). */
export const IMAGE_MAX_EDGE_PX = 1600;
export const IMAGE_WEBP_QUALITY = 80;
export const STORED_IMAGE_MIME = "image/webp";

/** Public path prefix of the media route — `${MEDIA_ROUTE_PREFIX}/${id}`. */
export const MEDIA_ROUTE_PREFIX = "/api/v1/media";

/** Media bytes never change for a given id, so they can be cached forever. */
export const MEDIA_CACHE_CONTROL = "public, max-age=31536000, immutable";
