"use client";

import type { ImageLoaderProps } from "next/image";
import { MEDIA_URL_VERSION } from "@/lib/constants/media";
import { isMediaRouteSrc } from "@/utils/media-url";

const UNSPLASH = "https://images.unsplash.com/";

/**
 * next/image loader (next.config.ts `images.loaderFile`). Database images are
 * resized by our own media route (`?w=`) and cached by the CDN, so pages never
 * go through `/_next/image` (no double function hop, no optimisation quota).
 * Unsplash resizes itself; everything else is served as is.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (isMediaRouteSrc(src)) return `${src}?w=${width}&v=${MEDIA_URL_VERSION}`;
  if (src.startsWith(UNSPLASH)) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("auto", "format");
    return url.toString();
  }
  return src;
}
