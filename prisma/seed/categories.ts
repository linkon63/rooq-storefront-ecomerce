import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { toneSvg } from "./placeholder-art";
import type { SizeChartIds } from "./size-charts";

type Child = { name: string; key: string; chart?: string };

const TREE: { name: string; slug: string; tone: [string, string]; children: Child[] }[] = [
  {
    name: "Men",
    slug: "men",
    tone: ["#2B2F36", "#5B6270"],
    children: [
      { name: "T-shirts", key: "t-shirts", chart: "mens-tops" },
      { name: "Shirts", key: "shirts", chart: "mens-tops" },
      { name: "Jeans", key: "jeans", chart: "bottoms-waist" },
      { name: "Trousers", key: "trousers", chart: "bottoms-waist" },
      { name: "Outerwear", key: "outerwear", chart: "mens-tops" },
      { name: "Footwear", key: "footwear", chart: "footwear-eu" },
      { name: "Accessories", key: "accessories" },
    ],
  },
  {
    name: "Women",
    slug: "women",
    tone: ["#C9A99B", "#F1E4DA"],
    children: [
      { name: "Tops", key: "tops", chart: "womens-tops-dresses" },
      { name: "Dresses", key: "dresses", chart: "womens-tops-dresses" },
      { name: "Jeans", key: "jeans", chart: "bottoms-waist" },
      { name: "Trousers", key: "trousers", chart: "bottoms-waist" },
      { name: "Outerwear", key: "outerwear", chart: "womens-tops-dresses" },
      { name: "Footwear", key: "footwear", chart: "footwear-eu" },
      { name: "Accessories", key: "accessories" },
    ],
  },
  {
    name: "Kids",
    slug: "kids",
    tone: ["#9DBEDF", "#E7EFE0"],
    children: [
      { name: "T-shirts", key: "t-shirts" },
      { name: "Tops", key: "tops" },
      { name: "Jeans", key: "jeans" },
      { name: "Outerwear", key: "outerwear" },
      { name: "Footwear", key: "footwear", chart: "footwear-eu" },
    ],
  },
];

/** slug ("men-shirts") → category id */
export type CategoryIds = Map<string, string>;

export async function seedCategories(db: SeedDb, charts: SizeChartIds): Promise<CategoryIds> {
  const ids: CategoryIds = new Map();
  for (const [rootIndex, root] of TREE.entries()) {
    const imageMediaId = await storeSvg(db, toneSvg(root.tone[0], root.tone[1]), `${root.name} collection`);
    const parent = await db.category.upsert({
      where: { slug: root.slug },
      update: { name: root.name, sortOrder: rootIndex, imageMediaId },
      create: { name: root.name, slug: root.slug, sortOrder: rootIndex, imageMediaId },
      select: { id: true },
    });
    ids.set(root.slug, parent.id);

    for (const [index, child] of root.children.entries()) {
      const slug = `${root.slug}-${child.key}`;
      const sizeChartId = child.chart ? (charts.get(child.chart) ?? null) : null;
      const row = await db.category.upsert({
        where: { slug },
        update: { name: child.name, parentId: parent.id, sortOrder: index, sizeChartId },
        create: { name: child.name, slug, parentId: parent.id, sortOrder: index, sizeChartId },
        select: { id: true },
      });
      ids.set(slug, row.id);
    }
  }
  return ids;
}
