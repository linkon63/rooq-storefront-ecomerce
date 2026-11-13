/**
 * One-off cleanup: removes the placeholder catalogue (demo products with
 * generated artwork) so only the real sarees remain, plus what pointed at it:
 * old collections, old hero campaigns, demo reviewers, categories no longer in
 * the tree. Safe to rerun. Run, then `pnpm db:seed`:
 *
 *   pnpm exec tsx --conditions=react-server scripts/remove-demo-data.ts
 *
 * Products that a wholesale request or a real stock movement (anything beyond
 * the seed's opening stock) still references are set inactive instead of deleted. Images are freed with releaseMedia, never a bare delete.
 */
import "dotenv/config";
import { prisma } from "../lib/server/prisma";
import { releaseMedia } from "../lib/server/media/release";
import { SAREE_PRODUCTS } from "../prisma/seed/saree-data";

const KEEP_PRODUCTS = SAREE_PRODUCTS.map((product) => product.slug);
const KEEP_COLLECTIONS = ["saree-edit"];
const KEEP_CATEGORIES = ["women", "women-sarees", "men", "kids", "jewellery"];
const OLD_CAMPAIGNS = ["The Summer Edit", "City Layers", "City Layers — AW Lookbook"];
const OLD_SALE_NAME = "Summer Sale — 20% off";

async function removeProducts() {
  const demo = await prisma.product.findMany({
    where: { slug: { notIn: KEEP_PRODUCTS } },
    select: { id: true, slug: true, media: { select: { mediaId: true } }, _count: { select: { wholesaleItems: true } } },
  });
  const mediaIds: string[] = [];
  let removed = 0;
  for (const product of demo) {
    const history = await prisma.stockMovement.count({ where: { variant: { productId: product.id }, type: { not: "INITIAL" } } });
    if (product._count.wholesaleItems > 0 || history > 0) {
      await prisma.product.update({ where: { id: product.id }, data: { status: "inactive" } });
      continue;
    }
    mediaIds.push(...product.media.map((row) => row.mediaId));
    // Opening-stock rows block variant deletion (Restrict); they are all that is left to clear.
    await prisma.stockMovement.deleteMany({ where: { variant: { productId: product.id }, type: "INITIAL" } });
    await prisma.product.delete({ where: { id: product.id } });
    removed += 1;
  }
  await releaseMedia(mediaIds);
  return { removed, kept: demo.length - removed };
}

async function removeCollections() {
  const old = await prisma.collection.findMany({
    where: { slug: { notIn: KEEP_COLLECTIONS } },
    select: { id: true, coverMediaId: true, looks: { select: { mediaId: true } } },
  });
  for (const collection of old) await prisma.collection.delete({ where: { id: collection.id } });
  await releaseMedia(old.flatMap((collection) => [collection.coverMediaId, ...collection.looks.map((look) => look.mediaId)]));
  return old.length;
}

async function removeCampaigns() {
  const old = await prisma.campaign.findMany({ where: { title: { in: OLD_CAMPAIGNS } }, select: { id: true, media: { select: { mediaId: true } } } });
  for (const campaign of old) await prisma.campaign.delete({ where: { id: campaign.id } });
  await releaseMedia(old.flatMap((campaign) => campaign.media.map((row) => row.mediaId)));
  await prisma.productDiscount.updateMany({ where: { name: OLD_SALE_NAME }, data: { name: "Sale" } });
  return old.length;
}

async function removeCategories() {
  const old = await prisma.category.findMany({
    where: { slug: { notIn: KEEP_CATEGORIES } },
    select: { id: true, imageMediaId: true, parentId: true },
  });
  // Children before parents: the parent relation is Restrict.
  for (const category of [...old].sort((a, b) => Number(Boolean(b.parentId)) - Number(Boolean(a.parentId)))) {
    await prisma.category.delete({ where: { id: category.id } });
  }
  await releaseMedia(old.map((category) => category.imageMediaId));
  return old.length;
}

async function removeDemoReviewers() {
  const { count } = await prisma.user.deleteMany({ where: { email: { endsWith: ".demo@rooq.local" } } });
  return count;
}

async function main() {
  const products = await removeProducts();
  console.log(`✓ products: ${products.removed} removed, ${products.kept} kept inactive (wholesale requests or stock history)`);
  console.log(`✓ ${await removeCollections()} old collections`);
  console.log(`✓ ${await removeCampaigns()} old campaigns`);
  console.log(`✓ ${await removeCategories()} old categories`);
  console.log(`✓ ${await removeDemoReviewers()} demo reviewers`);
}

main()
  .catch((error: unknown) => {
    console.error("Cleanup failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
