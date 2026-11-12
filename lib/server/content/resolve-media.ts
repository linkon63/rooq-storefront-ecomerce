import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { mediaIdFromUrl } from "@/utils/media-url";
import { badRequest } from "../http-error";
import { prisma } from "../prisma";

/**
 * Turns image references sent by the admin (a "/api/v1/media/<id>" URL from
 * POST /upload, or a bare media id) into existing Media ids, in order.
 * An unknown reference is a 400 rather than a foreign-key error later.
 */
export async function resolveMediaIds(refs: readonly string[]): Promise<string[]> {
  const ids = [...new Set(refs.map((ref) => mediaIdFromUrl(ref) ?? ref.trim()).filter(Boolean))];
  if (ids.length === 0) return [];
  const found = await prisma.media.findMany({ where: { id: { in: ids } }, select: { id: true } });
  const known = new Set(found.map((row) => row.id));
  const missing = ids.find((id) => !known.has(id));
  if (missing) throw badRequest(ERROR_MESSAGES.media.notFoundById(missing));
  return ids;
}

export async function resolveMediaId(ref: string): Promise<string> {
  const [id] = await resolveMediaIds([ref]);
  if (!id) throw badRequest(ERROR_MESSAGES.media.notFound);
  return id;
}
