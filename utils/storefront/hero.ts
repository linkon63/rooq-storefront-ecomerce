import { HOME_PAGE_KEY, SECTION_TITLES } from "@/lib/constants/content";
import type { ProductCard } from "@/types/storefront/catalog";
import type { HeroCampaign, HeroImage, HeroSlide, HomeHeroData } from "@/types/storefront/content";

type CampaignLike = {
  title: string;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  section: { title: string; page: string };
  media: HeroImage[];
};

type SlideLike = { id: string; image: HeroImage; product: { id: string; status: string } | null };

/** Picks the first live hero campaign that has images (pure; the list is already live-only). */
export function toHeroCampaign(campaigns: readonly CampaignLike[]): HeroCampaign | null {
  const hero = campaigns.find(
    (campaign) => campaign.section.page === HOME_PAGE_KEY && campaign.section.title === SECTION_TITLES.hero && campaign.media.length > 0,
  );
  if (!hero) return null;
  return { title: hero.title, description: hero.description, linkUrl: hero.linkUrl, linkLabel: hero.linkLabel, images: hero.media };
}

/** Ids of the active products linked to slides (only these get a card). */
export function linkedProductIds(slides: readonly SlideLike[]): string[] {
  return [...new Set(slides.flatMap((slide) => (slide.product?.status === "active" ? [slide.product.id] : [])))];
}

/** Slides with their product cards attached (a slide whose product is hidden or gone has none). */
export function attachProducts(slides: readonly SlideLike[], cards: readonly ProductCard[]): HeroSlide[] {
  const byId = new Map(cards.map((card) => [card.id, card]));
  return slides.map((slide) => ({ id: slide.id, image: slide.image, product: (slide.product && byId.get(slide.product.id)) ?? null }));
}

/** What the hero actually shows: the chosen mode when it has content, else whichever does. */
export function heroVariant(hero: HomeHeroData): "slider" | "campaign" | "text" {
  const hasSlides = hero.slides.length > 0;
  const hasCampaign = Boolean(hero.campaign?.images.length);
  if (hero.mode === "SLIDER" && hasSlides) return "slider";
  if (hero.mode === "CAMPAIGN" && hasCampaign) return "campaign";
  if (hasSlides) return "slider";
  return hasCampaign ? "campaign" : "text";
}
