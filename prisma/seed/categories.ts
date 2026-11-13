import { readFile } from "node:fs/promises";
import path from "node:path";
import { releaseMedia } from "../../lib/server/media/release";
import { saveImage } from "../../lib/server/media/save-image";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { toneSvg } from "./placeholder-art";
import type { SizeChartIds } from "./size-charts";

type Child = { name: string; key: string; chart?: string };
type Root = {
  name: string;
  slug: string;
  tone: [string, string];
  /** File in data/category-photos (CC0 photos from stocksnap.io). */
  photo?: string;
  /** Announced in the storefront as "coming soon"; switch off in the admin when it launches. */
  comingSoon?: boolean;
  children: Child[];
};

const PHOTO_ROOT = path.resolve(process.cwd(), "data/category-photos");

const TREE: Root[] = [
  { name: "Women", slug: "women", tone: ["#C9A99B", "#F1E4DA"], children: [{ name: "Sarees", key: "sarees" }] },
  // stocksnap.io/photo/man-fashion-MGUA6ZIL09 (CC0)
  { name: "Men", slug: "men", tone: ["#2B2F36", "#5B6270"], photo: "men.jpg", comingSoon: true, children: [] },
  // stocksnap.io/photo/autumn-outdoors-SVJE4G0VUO (CC0)
  { name: "Kids", slug: "kids", tone: ["#9DBEDF", "#E7EFE0"], photo: "kids.jpg", comingSoon: true, children: [] },
  // stocksnap.io/photo/hand-jewelry-VHIX76K7EH (CC0)
  { name: "Jewellery", slug: "jewellery", tone: ["#A08C6B", "#F0DFC6"], photo: "jewellery.jpg", comingSoon: true, children: [] },
];

/** slug ("women-sarees") → category id */
export type CategoryIds = Map<string, string>;

const placeholderAlt = (name: string) => `${name} collection`;

async function seedImage(db: SeedDb, root: Root): Promise<string> {
  if (!root.photo) return storeSvg(db, toneSvg(root.tone[0], root.tone[1]), placeholderAlt(root.name));
  const saved = await saveImage(await readFile(path.join(PHOTO_ROOT, root.photo)), { alt: root.name, db });
  return saved.id;
}

/**
 * Upserts the root. An image chosen in the admin is never overwritten: the
 * seed only sets one when there is none or it is still the seed placeholder.
 * "Coming soon" is only (re)applied while the category has no products, so a
 * launched category is never flipped back.
 */
async function upsertRoot(db: SeedDb, root: Root, sortOrder: number): Promise<string> {
  const current = await db.category.findUnique({
    where: { slug: root.slug },
    select: { imageMediaId: true, imageMedia: { select: { alt: true } }, _count: { select: { products: true } } },
  });
  const replaceImage = !current || !current.imageMediaId || current.imageMedia?.alt === placeholderAlt(root.name);
  const imageMediaId = replaceImage ? await seedImage(db, root) : undefined;
  const comingSoon = Boolean(root.comingSoon) && (current?._count.products ?? 0) === 0;
  const row = await db.category.upsert({
    where: { slug: root.slug },
    update: { name: root.name, sortOrder, ...(imageMediaId ? { imageMediaId } : {}), ...(root.comingSoon ? { isComingSoon: comingSoon } : {}) },
    create: { name: root.name, slug: root.slug, sortOrder, imageMediaId, isComingSoon: comingSoon },
    select: { id: true },
  });
  if (imageMediaId && current?.imageMediaId && current.imageMediaId !== imageMediaId) await releaseMedia(current.imageMediaId, db);
  return row.id;
}

export async function seedCategories(db: SeedDb, charts: SizeChartIds): Promise<CategoryIds> {
  const ids: CategoryIds = new Map();
  for (const [rootIndex, root] of TREE.entries()) {
    const parentId = await upsertRoot(db, root, rootIndex);
    ids.set(root.slug, parentId);

    for (const [index, child] of root.children.entries()) {
      const slug = `${root.slug}-${child.key}`;
      const sizeChartId = child.chart ? (charts.get(child.chart) ?? null) : null;
      const row = await db.category.upsert({
        where: { slug },
        update: { name: child.name, parentId, sortOrder: index, sizeChartId },
        create: { name: child.name, slug, parentId, sortOrder: index, sizeChartId },
        select: { id: true },
      });
      ids.set(slug, row.id);
    }
  }
  return ids;
}
