/**
 * Rooq demo seed — idempotent (every write is an upsert keyed on a natural
 * unique column), safe to rerun.  Run: pnpm db:seed
 *
 * Uses the app's own media pipeline (sharp → WebP → Media + MediaBlob), so
 * seeded images are served by GET /api/v1/media/:id like real uploads.
 */
import "dotenv/config";
import { prisma } from "../lib/server/prisma";
import { seedAuth } from "./seed/auth";
import { seedMasters } from "./seed/masters";
import { seedSizeCharts } from "./seed/size-charts";
import { seedCategories } from "./seed/categories";
import { seedBrandsAndTags, seedStore } from "./seed/store";
import { seedProducts } from "./seed/products";
import { seedCollections } from "./seed/collections";
import { seedContent } from "./seed/content";

async function main() {
  const started = Date.now();
  const { admin } = await seedAuth(prisma);
  console.log(`✓ roles, permissions, staff account (${admin.email})`);

  const store = await seedStore(prisma);
  console.log("✓ settings, contacts, policies, sections, coupon, units, supplier");

  const masters = await seedMasters(prisma);
  console.log(`✓ ${masters.sizes.size} sizes, ${masters.colors.size} colours`);

  const charts = await seedSizeCharts(prisma, masters);
  const categories = await seedCategories(prisma, charts);
  console.log(`✓ ${charts.size} size charts, ${categories.size} categories`);

  const { brands, tags, attributeValues } = await seedBrandsAndTags(prisma);
  const products = await seedProducts(prisma, { masters, categories, brands, tags, attributeValues, ...store });
  const variantCount = await prisma.productVariant.count();
  console.log(`✓ ${products.size} products, ${variantCount} variants`);

  const collections = await seedCollections(prisma, products);
  const content = await seedContent(prisma);
  console.log(`✓ ${content.campaigns} campaigns, empty Sale discount`);
  const mediaCount = await prisma.media.count();
  console.log(`✓ ${collections} collections · ${mediaCount} media rows · ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
