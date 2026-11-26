/** Upload limit for a reel; stays under the host's request body limit. */
export const MAX_REEL_MB = 4;
export const MAX_REEL_BYTES = MAX_REEL_MB * 1024 * 1024;
export const REEL_MIME = "video/mp4";
/** A reel's bytes never change (replace = delete and add). */
export const REEL_CACHE_CONTROL = "public, max-age=31536000, immutable";
/** How many reels the home page shows. */
export const HOME_REEL_LIMIT = 8;
