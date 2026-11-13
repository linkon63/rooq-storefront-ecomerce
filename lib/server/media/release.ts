import "server-only";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "../prisma";

type MediaDb = Pick<Prisma.TransactionClient, "media">;

/**
 * Every relation that can point at a Media row. Images are deduplicated by
 * checksum, so one row may back a product photo and a campaign banner at the
 * same time. Most of these relations are SetNull/Cascade, so a plain delete
 * would silently strip the image from every other owner — we count
 * references ourselves instead of relying on a foreign-key refusal.
 */
const referenceCount = {
  userAvatars: true,
  categoryImages: true,
  brandLogos: true,
  productMedia: true,
  reviewMedia: true,
  collectionCovers: true,
  lookImages: true,
  campaignMedia: true,
  heroSlides: true,
  newsCovers: true,
  settingLogos: true,
  settingIcons: true,
  settingFavicons: true,
  settingYoutubeThumbs: true,
  orderItemImages: true,
} satisfies Prisma.MediaCountOutputTypeSelect;

/**
 * Deletes the given media rows (and their bytes, by cascade) when nothing
 * references them any more. Call it after the owning link was removed.
 * Accepts one id or many; null/undefined ids are ignored.
 */
export async function releaseMedia(
  ids: string | null | undefined | readonly (string | null | undefined)[],
  db: MediaDb = prisma,
): Promise<void> {
  const list = Array.isArray(ids) ? ids : [ids];
  const unique = [...new Set(list.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return;

  const rows = await db.media.findMany({
    where: { id: { in: unique } },
    select: { id: true, _count: { select: referenceCount } },
  });
  const unused = rows
    .filter((row) => Object.values(row._count).every((count) => count === 0))
    .map((row) => row.id);
  if (unused.length > 0) await db.media.deleteMany({ where: { id: { in: unused } } });
}
