/**
 * Pushes only the catalogue in data/product-photos (README.md + photos) to the
 * database. Unlike `pnpm db:seed`, it leaves settings, categories, campaigns
 * and collections as they are in the admin.
 *
 *   pnpm db:seed:products
 */
import "dotenv/config";
import { prisma } from "../lib/server/prisma";
import { COLORS } from "../prisma/seed/masters";
import { seedProducts } from "../prisma/seed/products";

const bySlug = (rows: { id: string; slug: string }[]) => new Map(rows.map((row) => [row.slug, row.id]));

async function main() {
  const select = { id: true, slug: true } as const;
  const colors = await prisma.color.findMany();
  const sizes = await prisma.size.findMany();
  const [piece, pair, supplier] = await Promise.all([
    prisma.unit.findUniqueOrThrow({ where: { code: "pcs" } }),
    prisma.unit.findUniqueOrThrow({ where: { code: "pair" } }),
    prisma.supplier.findFirstOrThrow({ where: { name: "Rooq Atelier Ltd." } }),
  ]);
  const products = await seedProducts(prisma, {
    masters: {
      // The SKU code lives only in the seed list, not in the database.
      colors: new Map(colors.map((color) => [color.slug, { ...color, code: COLORS.find((seed) => seed.slug === color.slug)?.code ?? "" }])),
      sizes: new Map(sizes.map((size) => [size.slug, size])),
    },
    categories: bySlug(await prisma.category.findMany({ select })),
    brands: bySlug(await prisma.brand.findMany({ select })),
    tags: bySlug(await prisma.tag.findMany({ select })),
    attributeValues: new Map(),
    pieceUnitId: piece.id,
    pairUnitId: pair.id,
    supplierId: supplier.id,
  });
  console.log(`✓ ${products.size} products from data/product-photos/README.md`);
}

main()
  .catch((error: unknown) => {
    console.error("Product seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
