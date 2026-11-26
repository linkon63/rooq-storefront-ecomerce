import { readFile } from "node:fs/promises";
import path from "node:path";
import { releaseMedia } from "../../lib/server/media/release";
import { saveImage } from "../../lib/server/media/save-image";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { toneSvg } from "./placeholder-art";
import type { SizeChartIds } from "./size-charts";

type Photo = {
  /** File in data/category-photos; it always replaces the category image. */
  photo?: string;
  /** Announced in the storefront as "coming soon"; switch off in the admin when it launches. */
  comingSoon?: boolean;
};
type Child = Photo & { name: string; key: string; chart?: string };
type Root = Photo & { name: string; slug: string; tone: [string, string]; children: Child[] };

const PHOTO_ROOT = path.resolve(process.cwd(), "data/category-photos");

const TREE: Root[] = [
  {
    name: "Women", slug: "women", tone: ["#C9A99B", "#F1E4DA"], photo: "women.jpg",
    children: [
      { name: "Cotton Saree", key: "sarees", photo: "Cotton Sharee.jpg" },
      { name: "Jamdani", key: "jamdani", photo: "Jamdani Comming soon category.png", comingSoon: true },
      { name: "Manipuri", key: "manipuri", photo: "manipuri saree.jpeg", comingSoon: true },
    ],
  },
  // The former "Men" root, renamed in the admin; it keeps the image chosen there.
  { name: "Slik", slug: "men", tone: ["#2B2F36", "#5B6270"], comingSoon: true, children: [] },
];

/** slug ("women-sarees") → category id */
export type CategoryIds = Map<string, string>;

async function savePhoto(db: SeedDb, file: string, name: string): Promise<string> {
  const saved = await saveImage(await readFile(path.join(PHOTO_ROOT, file)), { alt: name, db });
  return saved.id;
}

/**
 * Upserts one category. A photo from the folder wins; without one, the image
 * chosen in the admin stays and a placeholder only fills an empty slot.
 * "Coming soon" is only applied while the category has no products, so a
 * launched category is never flipped back.
 */
async function upsertCategory(
  db: SeedDb,
  node: Photo & { name: string; slug: string; tone?: [string, string] },
  fields: { sortOrder: number; parentId?: string; sizeChartId?: string | null },
): Promise<string> {
  const current = await db.category.findUnique({
    where: { slug: node.slug },
    select: { imageMediaId: true, _count: { select: { products: true } } },
  });
  let imageMediaId: string | undefined;
  if (node.photo) imageMediaId = await savePhoto(db, node.photo, node.name);
  else if (!current?.imageMediaId && node.tone) imageMediaId = await storeSvg(db, toneSvg(node.tone[0], node.tone[1]), `${node.name} collection`);

  const data = {
    name: node.name,
    ...fields,
    ...(imageMediaId ? { imageMediaId } : {}),
    ...(node.comingSoon ? { isComingSoon: (current?._count.products ?? 0) === 0 } : {}),
  };
  const row = await db.category.upsert({
    where: { slug: node.slug },
    update: data,
    create: { ...data, slug: node.slug },
    select: { id: true },
  });
  if (imageMediaId && current?.imageMediaId && current.imageMediaId !== imageMediaId) await releaseMedia(current.imageMediaId, db);
  return row.id;
}

export async function seedCategories(db: SeedDb, charts: SizeChartIds): Promise<CategoryIds> {
  const ids: CategoryIds = new Map();
  for (const [rootIndex, root] of TREE.entries()) {
    const parentId = await upsertCategory(db, root, { sortOrder: rootIndex });
    ids.set(root.slug, parentId);

    for (const [index, child] of root.children.entries()) {
      const slug = `${root.slug}-${child.key}`;
      const sizeChartId = child.chart ? (charts.get(child.chart) ?? null) : null;
      ids.set(slug, await upsertCategory(db, { ...child, slug }, { parentId, sortOrder: index, sizeChartId }));
    }
  }
  return ids;
}
