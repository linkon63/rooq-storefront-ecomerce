import HomeHero, { type HeroSlide } from "@/components/storefront/home/HomeHero";
import MostRecentItems from "@/components/storefront/home/MostRecentItems";
import LatestArrivals from "@/components/storefront/home/LatestArrivals";
import MostLovedFoods from "@/components/storefront/home/MostLovedFoods";
import FeatureStrip from "@/components/storefront/home/FeatureStrip";
import CustomerVoices from "@/components/storefront/home/CustomerVoices";
import OrganicShowcase from "@/components/storefront/home/OrganicShowcase";
import NewsletterCta from "@/components/storefront/home/NewsletterCta";
import { ORGANIC_SHOWCASE_ENABLED } from "@/lib/feature-flags";
import {
  fetchShopCampaigns,
  fetchShopCategories,
  fetchShopProducts,
  fetchShopSettings,
  isBannerSection,
  type ShopProduct,
} from "@/lib/shop-api";

/**
 * Without this the homepage is prerendered once at build and never regenerates,
 * so a product added in the admin never appears. 60s keeps the page static and
 * fast while picking up catalogue changes on its own.
 */
export const revalidate = 60;

/** The hero falls back to the artwork shipped with the design. */
const FALLBACK_SLIDE: HeroSlide = {
    image: "/images/home/moil.jpeg",
    href: "/shop?category=Mustard%20Oil",
    alt: "খাঁটি সরিষার তেল — cold pressed mustard oil",
};

/** Shown until Admin → Settings → Hero Banner has artwork of its own. */
const FALLBACK_BANNERS: HeroSlide[] = [
  {
    image: "/images/home/seed.jpeg",
    href: "/shop?category=Coconut%20Oil",
    alt: "seed",
  },
  {
    image: "/images/home/ghee.jpeg",
    href: "/shop?category=Mustard%20Oil",
    alt: "খাঁটি সরিষার তেল — cold pressed mustard oil",
  },
];

/** Biggest savings first, so the "loved" rail leads with the best offers. */
function byDiscount(products: ShopProduct[]): ShopProduct[] {
  const saving = (product: ShopProduct) =>
    product.originalPrice && product.originalPrice > product.price
      ? (product.originalPrice - product.price) / product.originalPrice
      : 0;
  return [...products].sort((a, b) => saving(b) - saving(a));
}

export default async function Home() {
  // One products call feeds both rails below; each of them slices what it needs.
  const [{ data: products }, categories, campaigns, settings] = await Promise.all([
    fetchShopProducts({ limit: 24 }),
    fetchShopCategories(),
    fetchShopCampaigns(),
    fetchShopSettings(),
  ]);

  // Campaigns filed under a banner section fill the two static slots beside the
  // hero; everything else rides the slider. Each click carries the offer the
  // artwork advertises through to the shop.
  const toSlides = (list: typeof campaigns): HeroSlide[] =>
    list.flatMap((campaign) =>
      campaign.images.map((image) => ({
        image,
        href: campaign.href,
        alt: campaign.title,
      })),
    );

  const campaignSlides = toSlides(campaigns.filter((c) => !isBannerSection(c.sectionTitle)));
  // Sorted by title so "Hero Banner 1" always takes the top slot, whatever
  // order the admin saved them in.
  const campaignBanners = toSlides(
    campaigns
      .filter((c) => isBannerSection(c.sectionTitle))
      .sort((a, b) => a.title.localeCompare(b.title)),
  );

  return (
    <main>
      <div className="space-y-14 lg:space-y-20">
        <HomeHero
          slides={campaignSlides.length > 0 ? campaignSlides : [FALLBACK_SLIDE]}
          banners={campaignBanners.length > 0 ? campaignBanners.slice(0, 2) : FALLBACK_BANNERS}
        />
        <MostRecentItems products={products} categories={categories} />
        {/* Products arrive newest first, so the first two are the latest. */}
        <LatestArrivals products={products} />
        <MostLovedFoods products={byDiscount(products).slice(0, 12)} />
        <FeatureStrip />
        <CustomerVoices social={settings?.socialContact} />
        {ORGANIC_SHOWCASE_ENABLED && <OrganicShowcase />}
      </div>
      {/* Outside the stack above: the newsletter band runs edge to edge and
          butts straight up against the section before it, with no gap. */}
      <NewsletterCta />
    </main>
  );
}
