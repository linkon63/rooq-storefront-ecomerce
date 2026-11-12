/**
 * Seeds only the content & marketing demo data (sections, campaigns, sale,
 * journal, reviews). Safe to rerun. Run after `pnpm db:seed`:
 *
 *   pnpm exec tsx --conditions=react-server scripts/seed-content.ts
 */
import "dotenv/config";
import { prisma } from "../lib/server/prisma";
import { seedContent } from "../prisma/seed/content";

seedContent(prisma)
  .then((counts) => console.log(`✓ ${counts.campaigns} campaigns, ${counts.news} articles, ${counts.reviews} reviews`))
  .catch((error: unknown) => {
    console.error("Content seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
