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
import { HomeStitch } from "@/components/storefront/home/stitch/home-stitch";
import { ReviewsShowcase } from "@/components/storefront/home/reviews-showcase";
import { ProductRail } from "@/components/storefront/product-card/product-rail";
import { RecentlyViewedRail } from "@/components/storefront/product-card/recently-viewed-rail";
import { HOME_SHELF_SIZE, PRODUCT_TAGS } from "@/lib/constants/storefront";
import { buildFaqs } from "@/utils/storefront/faqs";
import { getCategoryTree, getHomeHero, getStoreSettings, listCollections, productRail, recentReviews } from "@/lib/storefront/catalog-data";

const OFFERS_LIMIT = 8;
const REVIEWS_LIMIT = 6;
const HOME_FAQ_COUNT = 5;

/**
 * Home: hero (slider of looks), categories, new in (5), offers, collections (two newest pieces
 * each), best sellers (5), two spotlight products, the order journey (three.js), coming soon,
 * reviews, five common questions, contact and recently viewed, with a
 * needle sewing a thread down the page as it scrolls. Every read starts at once; collections stream in.
 */
export default async function HomePage() {
  const [settings, hero, categories, newIn, latest, offers, bestSellers, upcoming, reviews, lookbooks] = await Promise.all([
    getStoreSettings(),
    getHomeHero(),
    getCategoryTree(),
    productRail({ new: true, sort: "newest", limit: HOME_SHELF_SIZE }),
    productRail({ sort: "newest", limit: HOME_SHELF_SIZE }),
    productRail({ onSale: true, sort: "newest", limit: OFFERS_LIMIT }),
    productRail({ tag: PRODUCT_TAGS.bestSeller, sort: "popular", limit: HOME_SHELF_SIZE }),
    productRail({ tag: PRODUCT_TAGS.comingSoon, sort: "newest", limit: 4 }),
    recentReviews(REVIEWS_LIMIT),
    listCollections({ type: "LOOKBOOK", featured: true }),
  ]);

  const roots = categories.filter((category) => !category.parentId && category.isActive !== false);
  const lookbook = lookbooks[0] ?? null;

  return (
    <div className="relative flex flex-col gap-12 lg:gap-20">
      <HomeStitch />
      <HomeHero returnDays={settings.delivery.returnWindowDays} hero={hero} />
      <CategoryTiles categories={roots} />
      <Suspense fallback={null}>
        <SaleCountdown />
      </Suspense>
      <ProductRail title="New in" products={newIn.data.length ? newIn.data : latest.data} link={{ label: "See all new in", href: "/new" }} />
      <ProductRail title="Offers" products={offers.data} link={{ label: "See all offers", href: "/sale" }} />
      <Suspense fallback={null}>
        <FeaturedCollections />
      </Suspense>
      {lookbook ? <LookbookFeature lookbook={lookbook} /> : null}
      <ProductRail
        title="Best sellers"
        products={bestSellers.data}
        link={{ label: "See all best sellers", href: `/shop?tag=${PRODUCT_TAGS.bestSeller}` }}
      />
      <Suspense fallback={null}>
        <ProductHighlights fallback={bestSellers.data} />
      </Suspense>
      <OrderJourney />
      <ComingSoonSection categories={roots.filter((category) => category.isComingSoon)} products={upcoming.data} />
      <ReviewsShowcase reviews={reviews} />
      <HomeFaq faqs={buildFaqs(settings).slice(0, HOME_FAQ_COUNT)} />
      <HomeContact settings={settings} />
      <RecentlyViewedRail />
    </div>
  );
}
