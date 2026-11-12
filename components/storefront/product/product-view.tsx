"use client";

import type { ReactNode } from "react";
import type { ProductDetail } from "@/types/storefront/catalog";
import { BuyPanel } from "./buy-panel";
import { ProductGallery } from "./product-gallery";
import { ProductSelectionProvider } from "./selection-context";
import { TrackRecentlyViewed } from "./track-recently-viewed";

/**
 * Product page top: gallery left (sticky on desktop), buy panel right.
 * `details` is server-rendered content (description, care, delivery) passed
 * through as children so it never ships as client JS.
 */
export function ProductView({ product, details }: { product: ProductDetail; details: ReactNode }) {
  return (
    <ProductSelectionProvider product={product}>
      <TrackRecentlyViewed product={product} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ProductGallery />
        </div>
        <div className="flex flex-col gap-8">
          <BuyPanel />
          {details}
        </div>
      </div>
    </ProductSelectionProvider>
  );
}
