import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { badRequest } from "@/lib/server/http-error";
import { prisma } from "@/lib/server/prisma";
import { mediaIdFromUrl } from "@/utils/media-url";
import type { Tx } from "./selects";

/**
 * Image input → Media id. Accepts a `…MediaId`, or a "/api/v1/media/<id>"
 * url from POST /upload. `null`/"" clears; `undefined` leaves unchanged.
 */
export async function resolveMediaRef(
  input: { url?: string | null; mediaId?: string | null },
  db: Pick<Tx, "media"> = prisma,
): Promise<string | null | undefined> {
  if (input.mediaId === undefined && input.url === undefined) return undefined;
  const id = input.mediaId || mediaIdFromUrl(input.url ?? null);
  if (!id) {
    if (input.mediaId === null || input.mediaId === "" || input.url === null || input.url === "") return null;
    throw badRequest(ERROR_MESSAGES.media.urlNotRecognised);
  }
  const media = await db.media.findUnique({ where: { id }, select: { id: true } });
  if (!media) throw badRequest(ERROR_MESSAGES.media.notFoundById(id));
  return media.id;
}
