import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ShopBrowser from "@/components/storefront/shop/ShopBrowser";
import {
  fetchCampaignOffer,
  fetchDiscountOffer,
  fetchShopCategories,
  fetchShopProducts,
  type ShopOffer,
} from "@/lib/shop-api";

export const metadata: Metadata = {
  title: "Shop | Organishi",
  description:
    "Browse cold pressed oils, hand-churned ghee, raw honey, organic chips, spices and grains — all sourced directly from the farm.",
};

type ShopSearchParams = { discount?: string; campaign?: string };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  // The whole catalogue is small enough to filter client-side, which keeps the
  // facet counts accurate no matter which filters are applied.
  const [{ data: products }, categories, query] = await Promise.all([
    fetchShopProducts({ limit: 200 }),
    fetchShopCategories(),
    searchParams,
  ]);

  // Hero slides and banners link here carrying the offer they advertise, so the
  // shopper lands on those products instead of the whole catalogue.
  let offer: ShopOffer | null = null;
  if (query.discount) offer = await fetchDiscountOffer(query.discount);
  else if (query.campaign) offer = await fetchCampaignOffer(query.campaign);

  // An offer with no products of its own (a banner that advertises the shop in
  // general) falls through to the full catalogue rather than an empty page.
  const offerProductIds = offer?.productIds ?? [];
  const isFilteredByOffer = offerProductIds.length > 0;
  const offerProducts = isFilteredByOffer
    ? products.filter((product) => offerProductIds.includes(product.id))
    : products;

  return (
    <main>
      {/* ── Page banner ─────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/hero/shop-hero.jpg"
          alt="Our Shop"
          fill
          sizes="100vw"
          priority
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#1f2a17]/60" />

        <div className="mx-auto max-w-[1600px] px-4 py-16 text-center md:px-8 lg:py-20">
          <h1 className="font-display text-[30px] leading-tight text-white md:text-[44px]">
            Our Shop
          </h1>
          <p className="mt-3 text-[14px] text-white/80">
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span className="px-2">/</span>
            <span className="text-[#8fd06b]">Shop</span>
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="py-32 text-center text-gray-400">Loading shop…</div>}>
        <ShopBrowser
          products={offerProducts}
          categories={categories}
          offerName={isFilteredByOffer ? offer!.name : null}
        />
      </Suspense>
    </main>
  );
}
