/**
 * Home-page content: sections, hero/banner campaigns and an empty "Sale"
 * discount that products are attached to later. Idempotent: campaigns are
 * matched on (section, title), the discount on name.
 */
import { HOME_PAGE_KEY, SECTION_TITLES } from "../../lib/constants/content";
import { HERO_BANNER_SLOTS } from "@/lib/constants/hero-banners";
import { releaseMedia } from "../../lib/server/media/release";
import { saveImage } from "../../lib/server/media/save-image";
import type { SeedDb } from "./db";
import { storeSvg } from "./db";
import { toneSvg } from "./placeholder-art";
import { readDataPhotos } from "./product-photos";

type CampaignSeed = {
  section: string;
  title: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
  tone: [string, string];
  size: [number, number];
  /** Folder under data/ whose images become the campaign's slides (in file order). */
  photos?: string;
  discount?: boolean;
};

/** Add products to this discount in the admin (or here) when the first sale goes live. */
const SALE = { name: "Sale", value: 20 };
const DAY = 24 * 60 * 60 * 1000;

const CAMPAIGNS: CampaignSeed[] = [
  // Hero campaign (hero "Campaign" mode): its first photo is the banner. Edit it in the admin under Campaigns.
  { section: SECTION_TITLES.hero, title: "The Saree Edit", description: "Handloom cottons and zari borders in colours made for the season.", linkUrl: "/collections/saree-edit", linkLabel: "Shop the edit", tone: ["#B0125B", "#F2B8C6"], size: [1600, 900], photos: "product-photos/bright-pink-saree" },
  { section: SECTION_TITLES.newArrivals, title: "Just Landed", description: "New sarees every week.", linkUrl: "/new", linkLabel: "Shop new arrivals", tone: ["#D39A1F", "#F0DFC6"], size: [1600, 700] },
  ...HERO_BANNER_SLOTS.map((slot, index) => ({
    section: SECTION_TITLES.banner,
    title: slot.title,
    description: ["Sale: coming soon", "Sarees", "New in"][index],
    linkUrl: ["/sale", "/shop?category=women-sarees", "/new"][index],
    linkLabel: "Shop now",
    tone: ([["#B0125B", "#7A6A4F"], ["#1F7A80", "#1C3934"], ["#D39A1F", "#B08454"]] as [string, string][])[index],
    size: (index === 0 ? [1144, 640] : [552, 300]) as [number, number],
    discount: index === 0,
  })),
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

/** The sale exists with no products yet; attach products to it later. */
async function seedSaleDiscount(db: SeedDb): Promise<string> {
  const existing = await db.productDiscount.findFirst({ where: { name: SALE.name }, select: { id: true } });
  if (existing) return existing.id;
  const created = await db.productDiscount.create({
    data: { name: SALE.name, type: "percentage", value: SALE.value, startDate: new Date(), endDate: new Date(Date.now() + 365 * DAY) },
    select: { id: true },
  });
  return created.id;
}

/** A campaign's images: its photo folder when it has one, else a generated tone placeholder. */
async function campaignImages(db: SeedDb, seed: CampaignSeed): Promise<string[]> {
  if (!seed.photos) return [await storeSvg(db, toneSvg(seed.tone[0], seed.tone[1], seed.size[0], seed.size[1]), seed.title)];
  const photos = await readDataPhotos(seed.photos);
  const saved = [];
  for (const [index, photo] of photos.entries()) {
    saved.push((await saveImage(photo.bytes, { alt: `${seed.title}, look ${index + 1}`, db })).id);
  }
  return saved;
}

async function seedCampaigns(db: SeedDb, discountId: string): Promise<number> {
  const sectionIds = new Map<string, string>();
  for (const [index, title] of [SECTION_TITLES.hero, SECTION_TITLES.newArrivals, SECTION_TITLES.lookbook, SECTION_TITLES.banner].entries()) {
    sectionIds.set(title, await upsertSection(db, title, index + 1));
  }
  for (const seed of CAMPAIGNS) {
    const sectionId = sectionIds.get(seed.section);
    if (!sectionId) continue;
    const mediaIds = await campaignImages(db, seed);
    const data = {
      description: seed.description,
      linkUrl: seed.linkUrl,
      linkLabel: seed.linkLabel,
      status: "active" as const,
      hasDiscount: Boolean(seed.discount),
      discountId: seed.discount ? discountId : null,
    };
    const existing = await db.campaign.findFirst({ where: { sectionId, title: seed.title }, select: { id: true, media: { select: { mediaId: true } } } });
    const media = { deleteMany: {}, create: mediaIds.map((mediaId, position) => ({ mediaId, position })) };
    if (existing) {
      await db.campaign.update({ where: { id: existing.id }, data: { ...data, media } });
      await releaseMedia(existing.media.map((row) => row.mediaId).filter((id) => !mediaIds.includes(id)), db);
    } else {
      await db.campaign.create({ data: { ...data, title: seed.title, sectionId, media: { create: media.create } } });
    }
  }
  return CAMPAIGNS.length;
}

export async function seedContent(db: SeedDb): Promise<{ campaigns: number }> {
  const discountId = await seedSaleDiscount(db);
  return { campaigns: await seedCampaigns(db, discountId) };
}
