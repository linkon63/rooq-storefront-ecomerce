/**
 * Pushes only the category tree and the photos in data/category-photos.
 * Categories that are no longer sold are hidden (not deleted).
 *
 *   pnpm db:seed:categories
 */
import "dotenv/config";
import { prisma } from "../lib/server/prisma";
import { seedCategories } from "../prisma/seed/categories";

const HIDDEN = ["kids", "jewellery"];

async function main() {
  const categories = await seedCategories(prisma, new Map());
  const { count } = await prisma.category.updateMany({ where: { slug: { in: HIDDEN } }, data: { isActive: false } });
  console.log(`✓ ${categories.size} categories updated, ${count} hidden`);
}

main()
  .catch((error: unknown) => {
    console.error("Category seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
