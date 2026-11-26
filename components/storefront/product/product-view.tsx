"use client";

import type { ReactNode } from "react";
import type { ProductDetail } from "@/types/storefront/catalog";
import { BuyPanel } from "./buy-panel";
import { GalleryActions } from "./gallery-actions";
import { ProductGallery } from "./product-gallery";
import { TrackRecentlyViewed } from "./track-recently-viewed";

/**
 * Product page top: gallery left (sticky on desktop), buy panel right.
 * `details` is server-rendered content (description, care, delivery) passed
 * through as children so it never ships as client JS.
 */
export function ProductView({ product, details }: { product: ProductDetail; details: ReactNode }) {
  return (
    <>
      <TrackRecentlyViewed product={product} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-12 xl:gap-16">
        <div className="relative max-md:-mt-4 lg:sticky lg:top-20 lg:self-start">
          <ProductGallery />
          <GalleryActions product={product} />
        </div>
        <div className="flex flex-col gap-8">
          <BuyPanel />
          {details}
        </div>
      </div>
    </>
  );
}
