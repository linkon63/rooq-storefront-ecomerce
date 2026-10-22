import HomeHero, { type HeroSlide } from "@/components/storefront/home/HomeHero";
import MostRecentItems from "@/components/storefront/home/MostRecentItems";
import LatestArrivals from "@/components/storefront/home/LatestArrivals";
import MostLovedFoods, {
  MAX_LOVED_ITEMS,
} from "@/components/storefront/home/MostLovedFoods";
import FeatureStrip from "@/components/storefront/home/FeatureStrip";
import CustomerVoices from "@/components/storefront/home/CustomerVoices";
import OrganicShowcase from "@/components/storefront/home/OrganicShowcase";
import NewsletterCta from "@/components/storefront/home/NewsletterCta";
import { ORGANIC_SHOWCASE_ENABLED } from "@/lib/feature-flags";
import { HERO_BANNER_SLOTS, type HeroBannerSlot } from "@/lib/hero-banners";
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

/** Top and bottom right, each shown until its slot in Admin → Settings → Hero Banner has artwork. */
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

/**
 * The rail is curated from Admin → Tags: a product tagged Best Seller,
 * Highlight or Hero rides it. Matching is on the tag's slug, which the admin
 * derives from the name — "Best Seller" saves as `best-seller`.
 */
const LOVED_TAGS = ["best-seller", "highlight", "hero"];

/**
 * Tagged products first. With none of the three tags set anywhere the rail
 * falls back to the biggest savings, so the shelf is never empty on a shop
 * that has not curated it yet.
 */
function mostLoved(products: ShopProduct[]): ShopProduct[] {
  const tagged = products.filter((product) =>
    product.tags.some((tag) => LOVED_TAGS.includes(tag)),
  );
  return (tagged.length > 0 ? tagged : byDiscount(products)).slice(0, MAX_LOVED_ITEMS);
}

/** Biggest savings first, so the fallback above leads with the best offers. */
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

  // Admin → Settings → Hero Banner fills three slots, each a banner-section
  // campaign told apart by title: the main one leads the slider and the other
  // two are the static blocks beside it. Every other campaign rides the slider
  // after the main banner. Each click carries the offer the artwork advertises
  // through to the shop.
  const toSlides = (list: typeof campaigns): HeroSlide[] =>
    list.flatMap((campaign) =>
      campaign.images.map((image) => ({
        image,
        href: campaign.href,
        alt: campaign.title,
      })),
    );

  const slotArtwork = (key: HeroBannerSlot["key"]) => {
    const { title } = HERO_BANNER_SLOTS.find((slot) => slot.key === key)!;
    return toSlides(campaigns.filter((c) => isBannerSection(c.sectionTitle) && c.title === title));
  };

  const heroSlides = [
    ...slotArtwork("main"),
    ...toSlides(campaigns.filter((c) => !isBannerSection(c.sectionTitle))),
  ];
  // The layout needs both side blocks, so an empty slot keeps its default artwork.
  const heroBanners = [
    slotArtwork("top")[0] ?? FALLBACK_BANNERS[0],
    slotArtwork("bottom")[0] ?? FALLBACK_BANNERS[1],
  ];

  return (
    <main>
      <div className="space-y-14 lg:space-y-20">
        <HomeHero
          slides={heroSlides.length > 0 ? heroSlides : [FALLBACK_SLIDE]}
          banners={heroBanners}
        />
        <MostRecentItems products={products} categories={categories} />
        {/* Products arrive newest first, so the first two are the latest. */}
        <LatestArrivals products={products} />
        {/* Admin → Settings → General can switch the certification strip off.
            Without it, Most Loved and Customer Voices are both mist bands, so
            they share one wrapper and meet with no white gap between them —
            and Customer Voices drops its top padding so the two read as one
            band rather than leaving a double-height gap of mist. */}
        {settings?.showCertifications !== false ? (
          <>
            <MostLovedFoods products={mostLoved(products)} />
            <FeatureStrip />
            <CustomerVoices social={settings?.socialContact} />
          </>
        ) : (
          <div className="[&>section+section]:pt-0">
            <MostLovedFoods products={mostLoved(products)} />
            <CustomerVoices social={settings?.socialContact} />
          </div>
        )}
        {ORGANIC_SHOWCASE_ENABLED && <OrganicShowcase />}
      </div>
      {/* Outside the stack above: the newsletter band runs edge to edge and
          butts straight up against the section before it, with no gap. */}
      <NewsletterCta />
    </main>
  );
}
