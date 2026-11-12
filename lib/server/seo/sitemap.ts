import "server-only";
import { prisma } from "../prisma";

export type SitemapEntity = { slug: string; updatedAt: Date };

/** Slugs the sitemap lists: active, non-archived products; active categories and collections. */
export async function sitemapEntities(): Promise<{
  products: SitemapEntity[];
  categories: SitemapEntity[];
  collections: SitemapEntity[];
}> {
  const select = { slug: true, updatedAt: true } as const;
  const [products, categories, collections] = await Promise.all([
    prisma.product.findMany({ where: { status: "active", archivedAt: null }, select, orderBy: { updatedAt: "desc" }, take: 5000 }),
    prisma.category.findMany({ where: { isActive: true }, select }),
    prisma.collection.findMany({ where: { isActive: true }, select }),
  ]);
  return { products, categories, collections };
}
