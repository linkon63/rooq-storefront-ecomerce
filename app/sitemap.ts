import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants/storefront";
import { sitemapEntities, type SitemapEntity } from "@/lib/server/seo/sitemap";

export const revalidate = 3600;

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;

const STATIC_ROUTES: { path: string; changeFrequency: Freq; priority: number }[] = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/shop", changeFrequency: "daily", priority: 0.9 },
  { path: "/new", changeFrequency: "daily", priority: 0.9 },
  { path: "/sale", changeFrequency: "daily", priority: 0.8 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "monthly", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();
  const routes: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({ url: `${base}${route.path}`, lastModified: now, ...route }));

  const toEntries = (rows: SitemapEntity[], prefix: string, changeFrequency: Freq, priority: number) =>
    rows.map((row) => ({ url: `${base}${prefix}${encodeURIComponent(row.slug)}`, lastModified: row.updatedAt, changeFrequency, priority }));

  try {
    const { products, categories, collections } = await sitemapEntities();
    routes.push(
      ...toEntries(products, "/product/", "weekly", 0.8),
      ...toEntries(categories, "/shop?category=", "weekly", 0.6),
      ...toEntries(collections, "/collections/", "weekly", 0.6),
    );
  } catch (error) {
    // The database may be unreachable at build time; ship the static routes rather than fail the build.
    console.error("[sitemap] could not read the catalogue", error);
  }
  return routes;
}
