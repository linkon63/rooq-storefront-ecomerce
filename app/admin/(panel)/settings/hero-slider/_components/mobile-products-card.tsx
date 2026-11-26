"use client";

import { HERO_MOBILE_MAX } from "@/lib/constants/storefront";
import { useHeroMobile } from "../_hooks/use-hero-mobile";
import { MobileProductItem } from "./mobile-product-item";
import { ProductLinkField } from "./product-link-field";

/** Phone hero: the products it cycles through and the photo each one shows. */
export function MobileProductsCard() {
  const { items, loading, busy, add, setPhoto, remove, move } = useHeroMobile();
  const taken = new Set(items.map((item) => item.product.id));
  const full = items.length >= HERO_MOBILE_MAX;

  return (
    <div className="grid gap-4">
      {full ? (
        <p className="text-sm font-medium text-slate-500">The phone hero is full ({HERO_MOBILE_MAX}). Remove one to add another.</p>
      ) : (
        <ProductLinkField
          disabled={busy || loading}
          value={null}
          onChange={(product) => product && !taken.has(product.id) && add(product.id)}
        />
      )}
      {loading ? (
        <p className="text-sm font-medium text-slate-400">Loading phone hero…</p>
      ) : items.length === 0 ? (
        <p className="text-sm font-medium text-slate-500">None picked, so phones show the newest products.</p>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <MobileProductItem
              key={item.id}
              item={item}
              index={index}
              count={items.length}
              busy={busy}
              onPhoto={(mediaId) => setPhoto(index, mediaId)}
              onMove={(step) => move(index, step)}
              onRemove={() => remove(index)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}
