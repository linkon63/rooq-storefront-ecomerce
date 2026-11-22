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

/** Stored images are re-encoded until they fit this budget (fast page loads). */
export const IMAGE_MAX_BYTES = 250 * 1000;
/** Lowest WebP quality tried before the image is scaled down instead. */
export const IMAGE_MIN_WEBP_QUALITY = 50;
export const STORED_IMAGE_MIME = "image/webp";

/** Public path prefix of the media route — `${MEDIA_ROUTE_PREFIX}/${id}`. */
export const MEDIA_ROUTE_PREFIX = "/api/v1/media";

/**
 * Media bytes never change for a given id, so they can be cached forever —
 * in browsers (max-age) and on Vercel's CDN (s-maxage), which then serves
 * repeat requests without running the function or touching the database.
 */
export const MEDIA_CACHE_CONTROL = "public, max-age=31536000, s-maxage=31536000, immutable";

/**
 * Widths `GET /api/v1/media/:id?w=` resizes to — Next's default device and
 * image sizes, so every srcset entry is cacheable and nothing else is.
 */
export const MEDIA_RESIZE_WIDTHS: readonly number[] = [
  32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
];
export const MEDIA_RESIZE_QUALITY = 75;

/** Per-instance memory budget for recently served image bytes. */
export const MEDIA_MEMORY_CACHE_BYTES = 64 * 1024 * 1024;
