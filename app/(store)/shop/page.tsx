import { Suspense } from "react";
import type { Metadata } from "next";

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
    <Suspense fallback={<div className="py-32 text-center text-gray-400">Loading shop…</div>}>
      <ShopBrowser products={products} categories={categories} />
    </Suspense>
  );
}
