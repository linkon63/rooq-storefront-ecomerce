/**
 * Adds the first home page reels from `data/reels/<folder>.mp4`, each linked to
 * its product. Skips a product that already has a reel, so it is safe to re-run.
 *
 *   pnpm db:seed:reels
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createReel } from "../lib/server/reels/service";
import { prisma } from "../lib/server/prisma";

const REELS = [
  { file: "hawai-mithai", slug: "light-pink-floral-saree" },
  { file: "hoimonti", slug: "mustard-block-print-saree" },
  { file: "roktojoba", slug: "bright-pink-zari-border-saree" },
  { file: "shubhrota", slug: "off-white-red-border-saree" },
] as const;

async function main(): Promise<void> {
  for (const { file, slug } of REELS) {
    const product = await prisma.product.findUnique({ where: { slug }, select: { id: true, _count: { select: { reels: true } } } });
    if (!product || product._count.reels > 0) {
      console.log(`skipped ${file}: ${product ? "already has a reel" : "product not found"}`);
      continue;
    }
    const bytes = readFileSync(join(process.cwd(), "data", "reels", `${file}.mp4`));
    await createReel(new File([bytes], `${file}.mp4`), product.id);
    console.log(`added ${file}`);
  }
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
