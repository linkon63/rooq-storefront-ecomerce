/**
 * Prisma `select` for a media relation. NEVER select `blob` in list/detail
 * queries — bytes are only read by the media route.
 *
 *   include: { imageMedia: { select: mediaRefSelect } }  →  mediaSrc(row.imageMedia)
 */
export const mediaRefSelect = {
  id: true,
  provider: true,
  externalUrl: true,
  alt: true,
  width: true,
  height: true,
} as const;
