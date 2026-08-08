import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import ShopBrowser from "@/components/storefront/shop/ShopBrowser";
import { fetchShopCategories, fetchShopProducts } from "@/lib/shop-api";

export const metadata: Metadata = {
  title: "Shop | Organishi",
  description:
    "Browse cold pressed oils, hand-churned ghee, raw honey, organic chips, spices and grains — all sourced directly from the farm.",
};

export default async function ShopPage() {
  // The whole catalogue is small enough to filter client-side, which keeps the
  // facet counts accurate no matter which filters are applied.
  const [{ data: products }, categories] = await Promise.all([
    fetchShopProducts({ limit: 200 }),
    fetchShopCategories(),
  ]);

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
        <ShopBrowser products={products} categories={categories} />
      </Suspense>
    </main>
  );
}
