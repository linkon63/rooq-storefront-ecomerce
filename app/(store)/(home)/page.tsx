import { Suspense } from "react";
import { CategoryTiles } from "@/components/storefront/home/category-tiles";
import { ComingSoonSection } from "@/components/storefront/home/coming-soon-section";
import { FeaturedCollections } from "@/components/storefront/home/featured-collections";
import { HomeContact } from "@/components/storefront/home/home-contact";
import { HomeHero } from "@/components/storefront/home/home-hero";
import { LookbookFeature } from "@/components/storefront/home/lookbook-feature";
import { ProductHighlights } from "@/components/storefront/home/product-highlights/product-highlights";
import { OrderJourney } from "@/components/storefront/home/order-journey/order-journey";
import { SaleCountdown } from "@/components/storefront/home/sale-countdown/sale-countdown";
import { HomeFaq } from "@/components/storefront/home/home-faq";
import { ReviewsShowcase } from "@/components/storefront/home/reviews-showcase";
import { ProductRail } from "@/components/storefront/product-card/product-rail";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { HOME_BEST_SELLERS_SIZE, HOME_SHELF_SIZE, PRODUCT_TAGS } from "@/lib/constants/storefront";
import { getMessages } from "@/lib/i18n/server";
import { buildFaqs } from "@/utils/storefront/faqs";
import { getCategoryTree, getHomeHero, getStoreSettings, listCollections, productRail, recentReviews } from "@/lib/storefront/catalog-data";

const OFFERS_LIMIT = 8;
const REVIEWS_LIMIT = 6;
const HOME_FAQ_COUNT = 5;

/**
 * Home: hero (slider of looks), categories, new in (5), offers, collections (two newest pieces
 * each), best sellers (5), two spotlight products, the order journey (three.js), coming soon,
 * reviews, five common questions, contact and recently viewed. The
 * layout sews a thread down it as it scrolls (HomeStitch). Every read starts at once; collections stream in.
 */
export default async function HomePage() {
  const { locale, t } = await getMessages();
  const [settings, hero, categories, newIn, latest, offers, bestSellers, upcoming, reviews, lookbooks] = await Promise.all([
    getStoreSettings(),
    getHomeHero(),
    getCategoryTree(),
    productRail({ new: true, sort: "newest", limit: HOME_SHELF_SIZE }),
    productRail({ sort: "newest", limit: HOME_SHELF_SIZE }),
    productRail({ onSale: true, sort: "newest", limit: OFFERS_LIMIT }),
    productRail({ tag: PRODUCT_TAGS.bestSeller, sort: "popular", limit: HOME_BEST_SELLERS_SIZE }),
    productRail({ tag: PRODUCT_TAGS.comingSoon, sort: "newest", limit: 4 }),
    recentReviews(REVIEWS_LIMIT),
    listCollections({ type: "LOOKBOOK", featured: true }),
  ]);

  const roots = categories.filter((category) => !category.parentId && category.isActive !== false);
  const lookbook = lookbooks[0] ?? null;

  return (
    <div className="flex flex-col gap-12 lg:gap-20">
      {/* The stitched thread runs straight through the hero and starts its pattern below it. */}
      <div data-stitch-hero>
        <HomeHero returnDays={settings.delivery.returnWindowDays} hero={hero} />
      </div>
      <CategoryTiles categories={roots} />
      <Suspense fallback={null}>
        <SaleCountdown />
      </Suspense>
      <ProductRail title={t.home.newIn} products={newIn.data.length ? newIn.data : latest.data} link={{ label: t.home.seeNewIn, href: "/new" }} />
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
      <Suspense fallback={null}>
        <ProductHighlights fallback={bestSellers.data} />
      </Suspense>
      <OrderJourney t={t.home} />
      <ComingSoonSection categories={roots.filter((category) => category.isComingSoon)} products={upcoming.data} />
      <ReviewsShowcase reviews={reviews} />
      <HomeFaq faqs={buildFaqs(settings, locale).slice(0, HOME_FAQ_COUNT)} />
      <HomeContact settings={settings} />
      <RecentlyViewedRail />
    </div>
  );
}
