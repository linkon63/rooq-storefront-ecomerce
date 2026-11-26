import { NextResponse } from "next/server";
import { REEL_CACHE_CONTROL } from "@/lib/constants/reels";
import { route } from "@/lib/server/http";
import { getReelVideo } from "@/lib/server/reels/service";
import { idParam, parseParams } from "@/lib/server/validation";
import { parseByteRange } from "@/utils/reel";

/** GET /api/v1/reels/:id/video — public. The stored MP4, with `Range` support and a one-year cache. */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const { data, mimeType } = await getReelVideo(parseParams(params, idParam).id);
  const size = data.byteLength;
  const headers: Record<string, string> = {
    "Content-Type": mimeType,
    "Cache-Control": REEL_CACHE_CONTROL,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };
  const range = parseByteRange(request.headers.get("range"), size);
  if (range === "invalid") return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  const body = range ? data.slice(range.start, range.end + 1) : data;
  if (range) headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
  headers["Content-Length"] = String(body.byteLength);
  return new NextResponse(body, { status: range ? 206 : 200, headers });
});
