import type { ProductDetail } from "@/types/storefront/catalog";
import { galleryFor, initialColorId } from "./variant-selection";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Old links used /product/<uuid>; those are redirected to the slug URL. */
export function looksLikeId(value: string): boolean {
  return UUID.test(value);
}

export function leadImageUrl(product: ProductDetail): string | null {
  return galleryFor(product, initialColorId(product))[0]?.url ?? null;
}

/** schema.org Product with one Offer per variant price range. */
export function productJsonLd(product: ProductDetail, siteUrl: string, currency: string): Record<string, unknown> {
  const prices = product.variants.map((variant) => variant.price);
  const low = prices.length ? Math.min(...prices) : product.price;
  const high = prices.length ? Math.max(...prices) : product.price;
  const image = leadImageUrl(product);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription ?? product.description ?? undefined,
    sku: product.styleCode ?? undefined,
    brand: { "@type": "Brand", name: product.brand.name },
    image: image ? [`${siteUrl}${image}`] : undefined,
    material: product.material ?? undefined,
    aggregateRating:
      product.rating.count > 0
        ? { "@type": "AggregateRating", ratingValue: product.rating.average, reviewCount: product.rating.count }
        : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: currency,
      lowPrice: low,
      highPrice: high,
      availability: product.variants.some((variant) => variant.inStock)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${siteUrl}/product/${product.slug}`,
    },
  };
}
