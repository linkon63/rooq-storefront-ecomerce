import { NextResponse } from "next/server";
import { route } from "@/lib/server/http";
import { getMediaForServing } from "@/lib/server/media/queries";
import { MEDIA_CACHE_CONTROL } from "@/lib/constants/media";
import { etagFor, etagMatches } from "@/utils/media-url";

/**
 * GET /api/v1/media/:id — public. Streams a database-stored image with a
 * one-year immutable cache and a checksum ETag (304 on If-None-Match).
 * EXTERNAL media redirect to their URL.
 */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const media = await getMediaForServing(params.id);

  if (media.provider === "EXTERNAL" && media.externalUrl) {
    return NextResponse.redirect(media.externalUrl, 302);
  }

  const etag = media.checksum ? etagFor(media.checksum) : null;
  const cacheHeaders: Record<string, string> = { "Cache-Control": MEDIA_CACHE_CONTROL };
  if (etag) cacheHeaders.ETag = etag;

  if (etag && etagMatches(request.headers.get("if-none-match"), etag)) {
    return new NextResponse(null, { status: 304, headers: cacheHeaders });
  }

  return new NextResponse(media.data, {
    status: 200,
    headers: {
      ...cacheHeaders,
      "Content-Type": media.mimeType,
      "Content-Length": String(media.data.byteLength),
      "X-Content-Type-Options": "nosniff",
    },
  });
});
