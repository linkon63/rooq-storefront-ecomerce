import HomeHero, { type HeroSlide } from "@/components/storefront/home/HomeHero";
import MostRecentItems from "@/components/storefront/home/MostRecentItems";
import LatestArrivals from "@/components/storefront/home/LatestArrivals";
import MostLovedFoods from "@/components/storefront/home/MostLovedFoods";
import FeatureStrip from "@/components/storefront/home/FeatureStrip";
import CustomerVoices from "@/components/storefront/home/CustomerVoices";
import OrganicShowcase from "@/components/storefront/home/OrganicShowcase";
import NewsletterCta from "@/components/storefront/home/NewsletterCta";
import {
  fetchShopCampaigns,
  fetchShopCategories,
  fetchShopProducts,
  fetchShopSettings,
  isBannerSection,
  type ShopProduct,
} from "@/lib/shop-api";

/** The hero falls back to the artwork shipped with the design. */
const FALLBACK_SLIDE: HeroSlide = {
  image: "/images/home/hero-ghee.png",
  href: "/shop?category=Ghee",
  alt: "খাঁটি ঘি — pure hand-churned ghee",
};

/** Shown until Admin → Settings → Hero Banner has artwork of its own. */
const FALLBACK_BANNERS: HeroSlide[] = [
  {
    image: "/images/home/banner-coconut.png",
    href: "/shop?category=Coconut%20Oil",
    alt: "নারিকেল তেল — cold pressed virgin coconut oil",
  },
  {
    image: "/images/home/banner-mustard.png",
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
    <main className="space-y-14 lg:space-y-20">
      <HomeHero
        slides={campaignSlides.length > 0 ? campaignSlides : [FALLBACK_SLIDE]}
        banners={campaignBanners.length > 0 ? campaignBanners.slice(0, 2) : FALLBACK_BANNERS}
      />
      <MostRecentItems products={products} categories={categories} />
      {/* Products arrive newest first, so the first two are the latest. */}
      <LatestArrivals products={products} />
      <MostLovedFoods products={byDiscount(products).slice(0, 12)} />
      <FeatureStrip />
      <CustomerVoices social={(settings?.socialContact ?? {}) as Record<string, string | undefined>} />
      <OrganicShowcase />
      <NewsletterCta />
    </main>
  );
}
