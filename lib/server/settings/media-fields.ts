import "server-only";
import { mediaIdFromUrl, mediaSrc, type MediaRef } from "@/utils/media-url";
import { saveExternalMedia } from "../media/save-image";

/**
 * Resolves one image field of PATCH /settings to a Media id:
 *   mediaId given        → that id (null clears)
 *   url undefined        → undefined (unchanged)
 *   url "" / null        → null (cleared)
 *   url == current src   → current id (no duplicate rows on every save)
 *   "/api/v1/media/<id>" → <id>
 *   any other URL        → registered as EXTERNAL media
 */
export async function resolveMediaField(
  url: string | null | undefined,
  mediaId: string | null | undefined,
  current: (MediaRef & { id: string }) | null,
): Promise<string | null | undefined> {
  if (mediaId !== undefined) return mediaId;
  if (url === undefined) return undefined;
  if (!url) return null;
  if (current && mediaSrc(current) === url) return current.id;
  const id = mediaIdFromUrl(url);
  if (id) return id;
  return (await saveExternalMedia(url)).id;
}
