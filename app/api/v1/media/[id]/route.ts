import { NextResponse } from "next/server";
import { route } from "@/lib/server/http";
import { getMediaForServing } from "@/lib/server/media/queries";
import { resizeMedia } from "@/lib/server/media/resize";
import { MEDIA_CACHE_CONTROL, STORED_IMAGE_MIME } from "@/lib/constants/media";
import { etagFor, etagMatches, parseMediaWidth } from "@/utils/media-url";

/**
 * GET /api/v1/media/:id[?w=640] — public. Streams a database-stored image
 * (scaled down to `w` for srcset entries) with a one-year immutable cache and
 * a checksum ETag (304 on If-None-Match). Vercel's CDN keys on the full URL,
 * so each width is resized once. EXTERNAL media redirect to their URL.
 */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const media = await getMediaForServing(params.id);

  if (media.provider === "EXTERNAL" && media.externalUrl) {
    return NextResponse.redirect(media.externalUrl, 302);
  }

  const width = parseMediaWidth(request.nextUrl.searchParams.get("w"));
  const etag = media.checksum ? etagFor(width ? `${media.checksum}-w${width}` : media.checksum) : null;
  const cacheHeaders: Record<string, string> = { "Cache-Control": MEDIA_CACHE_CONTROL };
  if (etag) cacheHeaders.ETag = etag;

  if (etag && etagMatches(request.headers.get("if-none-match"), etag)) {
    return new NextResponse(null, { status: 304, headers: cacheHeaders });
  }

  const body = width ? await resizeMedia(media.data, width) : media.data;
  return new NextResponse(body, {
    status: 200,
    headers: {
      ...cacheHeaders,
      "Content-Type": width ? STORED_IMAGE_MIME : media.mimeType,
      "Content-Length": String(body.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
});
