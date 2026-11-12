import "server-only";
import { prisma } from "@/lib/server/prisma";
import { SEARCH_SUGGESTIONS_LIMIT } from "@/lib/constants/catalog";
import { mediaSrc } from "@/utils/media-url";
import { mediaRefSelect } from "@/lib/server/media/select";

const insensitive = (value: string) => ({ contains: value, mode: "insensitive" as const });

/** GET /search/suggestions?q= — quick name matches for the search box. */
export async function searchSuggestions(q: string | undefined) {
  const term = q?.trim();
  if (!term) return [];
  const rows = await prisma.product.findMany({
    where: {
      status: "active",
      archivedAt: null,
      OR: [{ name: insensitive(term) }, { styleCode: insensitive(term) }, { brand: { name: insensitive(term) } }],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      media: { select: { media: { select: mediaRefSelect } }, orderBy: [{ isPrimary: "desc" }, { position: "asc" }], take: 1 },
    },
    orderBy: [{ soldCount: "desc" }, { name: "asc" }],
    take: SEARCH_SUGGESTIONS_LIMIT,
  });
  return rows.map((row) => ({ id: row.id, name: row.name, slug: row.slug, imageUrl: mediaSrc(row.media[0]?.media) }));
}
