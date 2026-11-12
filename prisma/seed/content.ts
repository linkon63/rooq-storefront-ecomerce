/**
 * Content & marketing demo data: home sections, hero/banner campaigns, a sale
 * discount, journal articles and reviews with fit feedback. Idempotent —
 * campaigns are matched on (section, title), discounts on name, news on slug,
 * reviews on (product, user).
 */
import { HOME_PAGE_KEY, SECTION_TITLES } from "../../lib/constants/content";
import { HERO_BANNER_SLOTS } from "@/lib/constants/hero-banners";
import type { FitFeedback } from "../../lib/generated/prisma/enums";
import { roundRating } from "../../utils/mappers/review-summary";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { garmentSvg, toneSvg, type GarmentKind } from "./placeholder-art";

type CampaignSeed = {
  section: string;
  title: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
  tone: [string, string];
  size: [number, number];
  discount?: boolean;
};

const SALE = { name: "Summer Sale — 20% off", products: ["linen-camp-collar-shirt", "wrap-linen-dress", "canvas-tote-bag"] };

const CAMPAIGNS: CampaignSeed[] = [
  { section: SECTION_TITLES.hero, title: "The Summer Edit", description: "Linen, light cotton and easy shapes for the hottest months.", linkUrl: "/shop?collection=summer-edit", linkLabel: "Shop the edit", tone: ["#CDBB93", "#F4F1EB"], size: [1600, 900] },
  { section: SECTION_TITLES.hero, title: "City Layers", description: "Tailoring, knits and outerwear for cooler city days.", linkUrl: "/shop?collection=city-layers", linkLabel: "See the lookbook", tone: ["#3A3D42", "#B08454"], size: [1600, 900] },
  { section: SECTION_TITLES.newArrivals, title: "Just Landed", description: "New pieces every week — tees, denim and court sneakers.", linkUrl: "/shop?new=true", linkLabel: "Shop new arrivals", tone: ["#E9E1CF", "#9DBEDF"], size: [1600, 700] },
  { section: SECTION_TITLES.lookbook, title: "City Layers — AW Lookbook", description: "Two looks, styled head to toe. Shop every piece.", linkUrl: "/shop?collection=city-layers", linkLabel: "Shop the look", tone: ["#B08454", "#3A3D42"], size: [1600, 900] },
  ...HERO_BANNER_SLOTS.map((slot, index) => ({
    section: SECTION_TITLES.banner,
    title: slot.title,
    description: ["Summer Sale — 20% off linen", "Denim, re-cut", "Accessories under 2,000"][index],
    linkUrl: ["/shop?onSale=true", "/shop?category=jeans", "/shop?category=accessories"][index],
    linkLabel: "Shop now",
    tone: ([["#CDBB93", "#7A6A4F"], ["#9DBEDF", "#3A3D42"], ["#E9E1CF", "#B08454"]] as [string, string][])[index],
    size: (index === 0 ? [1144, 640] : [552, 300]) as [number, number],
    discount: index === 0,
  })),
];

const NEWS: { slug: string; title: string; excerpt: string; content: string; kind: GarmentKind; hex: string }[] = [
  { slug: "how-linen-should-fit", title: "How linen should fit", excerpt: "Relaxed, not sloppy: a quick guide to sizing linen shirts and dresses.", content: "Linen relaxes as you wear it. If you are between sizes in a relaxed fit, take the smaller one; in a slim fit, take your usual size. Shoulders are the one place that should fit exactly — the seam should sit on the edge of your shoulder.", kind: "shirt", hex: "#CDBB93" },
  { slug: "caring-for-your-denim", title: "Caring for your denim", excerpt: "Wash less, wash cold, dry flat — and your jeans keep their colour for years.", content: "Turn jeans inside out, wash cold on a gentle cycle and skip the tumble dryer. Rigid denim gives about half a size in the waist over the first few wears, so buy it snug.", kind: "trousers", hex: "#3A4F7A" },
  { slug: "the-aw-lookbook-is-here", title: "The AW lookbook is here", excerpt: "City Layers: tailoring, knits and outerwear styled two ways.", content: "This season is about layering: a camel coat over a fine rib top, an Oxford shirt under a knit. Every piece in the lookbook can be bought on its own or as a complete look.", kind: "outerwear", hex: "#B08454" },
];

const REVIEWERS = [
  { email: "ayesha.demo@rooq.local", name: "Ayesha R." },
  { email: "tanvir.demo@rooq.local", name: "Tanvir H." },
  { email: "nadia.demo@rooq.local", name: "Nadia K." },
];

const REVIEWS: { product: string; reviewer: number; rating: number; title: string; comment: string; fit: FitFeedback; size?: string }[] = [
  { product: "oversized-heavyweight-tee", reviewer: 0, rating: 5, title: "Perfect boxy fit", comment: "Heavy cotton, holds its shape after washing.", fit: "TRUE_TO_SIZE", size: "M" },
  { product: "oversized-heavyweight-tee", reviewer: 1, rating: 4, title: "Roomy", comment: "Very oversized — I sized down and it is perfect.", fit: "RUNS_LARGE", size: "L" },
  { product: "linen-camp-collar-shirt", reviewer: 2, rating: 5, title: "Summer staple", comment: "Breathable and the collar sits nicely.", fit: "TRUE_TO_SIZE", size: "S" },
  { product: "high-rise-wide-leg-jeans", reviewer: 0, rating: 4, title: "Great shape", comment: "Waist is snug at first, gives after a few wears.", fit: "RUNS_SMALL" },
  { product: "leather-court-sneaker", reviewer: 1, rating: 5, title: "Clean and comfy", comment: "Comfortable from day one.", fit: "TRUE_TO_SIZE" },
];

async function upsertSection(db: SeedDb, title: string, position: number): Promise<string> {
  const row = await db.section.upsert({
    where: { page_title: { page: HOME_PAGE_KEY, title } },
    update: {},
    create: { page: HOME_PAGE_KEY, title, position },
    select: { id: true },
  });
  return row.id;
}

async function seedSaleDiscount(db: SeedDb): Promise<string> {
  const products = await db.product.findMany({ where: { slug: { in: SALE.products } }, select: { id: true } });
  const endDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const existing = await db.productDiscount.findFirst({ where: { name: SALE.name }, select: { id: true } });
  const links = { deleteMany: {}, create: products.map((p) => ({ productId: p.id })) };
  if (existing) {
    await db.productDiscount.update({ where: { id: existing.id }, data: { status: "active", products: links } });
    return existing.id;
  }
  const created = await db.productDiscount.create({
    data: { name: SALE.name, type: "percentage", value: 20, startDate: new Date(), endDate, products: { create: links.create } },
    select: { id: true },
  });
  return created.id;
}

async function seedCampaigns(db: SeedDb, discountId: string): Promise<number> {
  const sectionIds = new Map<string, string>();
  for (const [index, title] of [SECTION_TITLES.hero, SECTION_TITLES.newArrivals, SECTION_TITLES.lookbook, SECTION_TITLES.banner].entries()) {
    sectionIds.set(title, await upsertSection(db, title, index + 1));
  }
  for (const seed of CAMPAIGNS) {
    const sectionId = sectionIds.get(seed.section);
    if (!sectionId) continue;
    const mediaId = await storeSvg(db, toneSvg(seed.tone[0], seed.tone[1], seed.size[0], seed.size[1]), seed.title);
    const data = {
      description: seed.description,
      linkUrl: seed.linkUrl,
      linkLabel: seed.linkLabel,
      status: "active" as const,
      hasDiscount: Boolean(seed.discount),
      discountId: seed.discount ? discountId : null,
    };
    const existing = await db.campaign.findFirst({ where: { sectionId, title: seed.title }, select: { id: true } });
    const media = { deleteMany: {}, create: [{ mediaId, position: 0 }] };
    if (existing) await db.campaign.update({ where: { id: existing.id }, data: { ...data, media } });
    else await db.campaign.create({ data: { ...data, title: seed.title, sectionId, media: { create: media.create } } });
  }
  return CAMPAIGNS.length;
}

async function seedNews(db: SeedDb): Promise<void> {
  for (const [index, seed] of NEWS.entries()) {
    const coverMediaId = await storeSvg(db, garmentSvg({ hex: seed.hex, kind: seed.kind, view: 2, width: 1600, height: 1000 }), seed.title);
    const publishedAt = new Date(Date.now() - (index + 1) * 5 * 24 * 60 * 60 * 1000);
    const data = { title: seed.title, excerpt: seed.excerpt, content: seed.content, author: "Rooq Journal", coverMediaId, isPublished: true };
    await db.news.upsert({ where: { slug: seed.slug }, update: data, create: { ...data, slug: seed.slug, publishedAt } });
  }
}

async function seedReviews(db: SeedDb): Promise<number> {
  const role = await db.role.findFirst({ where: { name: "user" }, select: { id: true } });
  const users = [];
  for (const reviewer of REVIEWERS) {
    users.push(
      await db.user.upsert({
        where: { email: reviewer.email },
        update: {},
        create: { email: reviewer.email, name: reviewer.name, roleId: role?.id ?? null },
        select: { id: true },
      }),
    );
  }
  const touched = new Set<string>();
  for (const seed of REVIEWS) {
    const product = await db.product.findUnique({ where: { slug: seed.product }, select: { id: true } });
    const user = users[seed.reviewer];
    if (!product || !user) continue;
    const variant = seed.size
      ? await db.productVariant.findFirst({ where: { productId: product.id, size: { label: seed.size } }, select: { id: true } })
      : null;
    const data = { rating: seed.rating, title: seed.title, comment: seed.comment, fitFeedback: seed.fit, status: "APPROVED" as const, variantId: variant?.id ?? null };
    await db.review.upsert({
      where: { productId_userId: { productId: product.id, userId: user.id } },
      update: data,
      create: { ...data, productId: product.id, userId: user.id },
    });
    touched.add(product.id);
  }
  for (const productId of touched) {
    const agg = await db.review.aggregate({ where: { productId, status: "APPROVED" }, _avg: { rating: true }, _count: { _all: true } });
    await db.product.update({ where: { id: productId }, data: { ratingAvg: roundRating(agg._avg.rating ?? 0), ratingCount: agg._count._all } });
  }
  return REVIEWS.length;
}

export async function seedContent(db: SeedDb): Promise<{ campaigns: number; news: number; reviews: number }> {
  const discountId = await seedSaleDiscount(db);
  const campaigns = await seedCampaigns(db, discountId);
  await seedNews(db);
  const reviews = await seedReviews(db);
  return { campaigns, news: NEWS.length, reviews };
}
