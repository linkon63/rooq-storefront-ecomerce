import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryCircles } from "@/components/storefront/home/category-circles";
import { CategoryTiles } from "@/components/storefront/home/category-tiles";
import { MadeByHand } from "@/components/storefront/home/made-by-hand/made-by-hand";
import { SareeUnfold } from "@/components/storefront/home/saree-unfold/saree-unfold";
import { ComingSoonSection } from "@/components/storefront/home/coming-soon-section";
import { FacebookReviews } from "@/components/storefront/home/facebook-reviews";
import { FeaturedCollections } from "@/components/storefront/home/featured-collections";
import { HomeContact } from "@/components/storefront/home/home-contact";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { LookbookFeature } from "@/components/storefront/home/lookbook-feature";
import { ProductHighlights } from "@/components/storefront/home/product-highlights/product-highlights";
import { OrderJourney } from "@/components/storefront/home/order-journey/order-journey";
import { SaleCountdown } from "@/components/storefront/home/sale-countdown/sale-countdown";
import { ProductRail } from "@/components/storefront/product-card/product-rail";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { ReelsSection } from "@/components/storefront/home/reels/reels-section";
import { SareeAbout } from "@/components/storefront/home/saree-about";
import { SEO_ALTERNATE_NAMES, SEO_SITE_DESCRIPTION } from "@/lib/constants/seo";
import { HOME_BEST_SELLERS_SIZE, HOME_HERO_PRODUCTS, HOME_NEW_IN_SIZE, PRODUCT_TAGS, SITE_URL } from "@/lib/constants/storefront";
import { COPY } from "@/lib/constants/storefront-copy";
import { getCategoryTree, getHomeHero, getStoreSettings, listCollections, productRail } from "@/lib/storefront/catalog-data";
import { siteJsonLd } from "@/utils/storefront/site-seo";

const OFFERS_LIMIT = 8;

export const metadata: Metadata = { alternates: { canonical: "/" } };

/**
 * Home: hero (slider of looks, woven headline; the newest three on phones),
 * the 3D saree unfold (lg+), categories (unrolling bolts), new in (8; slides
 * of four on phones), running offers with countdowns, offers,
 * collections (two newest pieces each), lookbook (parallax), best sellers (5),
 * two spotlight products, product reels, the made-by-hand numbers, the order journey, coming
 * soon, contact and recently viewed. The layout sews a thread down it as it
 * scrolls (HomeStitch). Every read starts at once; collections and numbers
 * stream in.
 */
export default async function HomePage() {
  const t = COPY;
  const [settings, hero, categories, newIn, latest, offers, bestSellers, upcoming, lookbooks] = await Promise.all([
    getStoreSettings(),
    getHomeHero(),
    getCategoryTree(),
    productRail({ new: true, sort: "newest", limit: HOME_NEW_IN_SIZE }),
    productRail({ sort: "newest", limit: HOME_NEW_IN_SIZE }),
    productRail({ onSale: true, sort: "newest", limit: OFFERS_LIMIT }),
    productRail({ tag: PRODUCT_TAGS.bestSeller, sort: "popular", limit: HOME_BEST_SELLERS_SIZE }),
    productRail({ tag: PRODUCT_TAGS.comingSoon, sort: "newest", limit: 4 }),
    listCollections({ type: "LOOKBOOK", featured: true }),
  ]);

  // Roots get a tile; so do announced sub-categories, to show they are coming soon.
  const tiles = categories
    .filter((category) => !category.parentId)
    .flatMap((root) => [root, ...(root.children ?? []).filter((child) => child.isComingSoon)])
    .filter((category) => category.isActive !== false);
  const lookbook = lookbooks[0] ?? null;

  return (
    <div data-home className="flex flex-col gap-8 md:gap-12 lg:gap-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(siteJsonLd(SITE_URL.replace(/\/$/, ""), SEO_SITE_DESCRIPTION, SEO_ALTERNATE_NAMES)).replace(/</g, "\\u003c"),
        }}
      />
      <CategoryCircles categories={tiles} />
      {/* The stitched thread runs straight through the hero and starts its pattern below it. */}
      <div data-stitch-hero>
        <HomeHero returnDays={settings.delivery.returnWindowDays} hero={hero} latest={latest.data.slice(0, HOME_HERO_PRODUCTS)} />
      </div>
      <SareeUnfold />
      <div className="max-md:hidden md:contents">
        <CategoryTiles categories={tiles} />
      </div>
      <ProductRail
        title={t.home.newIn}
        products={newIn.data.length ? newIn.data : latest.data}
        link={{ label: t.home.seeNewIn, href: "/new" }}
        layout="pages"
        dotLabel={t.home.goToSlide}
      />
      <Suspense fallback={null}>
        <SaleCountdown />
      </Suspense>
      <ProductRail title={t.home.offers} products={offers.data} link={{ label: t.home.seeOffers, href: "/sale" }} />
      <Suspense fallback={null}>
        <FeaturedCollections />
      </Suspense>
      {lookbook ? <LookbookFeature lookbook={lookbook} /> : null}
      <ProductRail
        title={t.home.bestSellers}
        products={bestSellers.data}
        layout="grid"
        link={
          bestSellers.meta.total > HOME_BEST_SELLERS_SIZE
            ? { label: t.home.seeBestSellers, href: `/shop?tag=${PRODUCT_TAGS.bestSeller}` }
            : undefined
        }
      />
      {/* Left out of the phone home screen to keep it short. */}
      <div className="max-md:hidden md:contents">
        <Suspense fallback={null}>
          <FacebookReviews />
        </Suspense>
        <Suspense fallback={null}>
          <ProductHighlights fallback={bestSellers.data} />
        </Suspense>
      </div>
      <Suspense fallback={null}>
        <ReelsSection />
      </Suspense>
      <div className="max-md:hidden md:contents">
        <Suspense fallback={null}>
          <MadeByHand />
        </Suspense>
        <OrderJourney t={t.home} />
        <ComingSoonSection categories={tiles.filter((category) => category.isComingSoon)} products={upcoming.data} />
        <HomeContact settings={settings} />
      </div>
      <RecentlyViewedRail />
      <SareeAbout copy={t.home.sareeAbout} />
    </div>
  );
}
