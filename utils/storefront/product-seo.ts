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

/** True for pieces filed under the sarees side of the category tree. */
function isSaree(product: ProductDetail): boolean {
  return product.breadcrumbs.some((crumb) => /saree|sharee|jamdani|manipuri/i.test(`${crumb.slug} ${crumb.name}`));
}

/** Title, description and keywords; text typed in the admin wins over the generated one. */
export function productSeoCopy(product: ProductDetail): { title: string; description: string; keywords: string[] } {
  const { metaTitle, metaDescription, metaKeywords } = product.seo;
  const saree = isSaree(product);
  const fabric = product.material ? `${product.material} ` : "";
  // The seed stores "<name> | Rooq" and the short description: both are generic.
  const customTitle = metaTitle && metaTitle !== `${product.name} | Rooq` ? metaTitle : null;
  const customDescription = metaDescription && metaDescription !== product.shortDescription ? metaDescription : null;
  const intro = saree
    ? `Buy ${product.name} ${fabric}saree (sharee) online in Bangladesh. Price ৳${product.price}.`
    : `Buy ${product.name} online in Bangladesh. Price ৳${product.price}.`;
  const typed = metaKeywords?.split(",").map((word) => word.trim()).filter(Boolean) ?? [];
  const generated = saree ? [`${product.name} saree`, `${product.name} sharee`, `${fabric}saree`, `${fabric}sharee price in BD`, "bd sharee", "শাড়ি"] : [product.name];
  return {
    title: customTitle ?? (saree ? `${product.name} ${fabric}Saree (Sharee) Price in BD` : `${product.name} Price in BD`),
    description: customDescription ?? [intro, product.shortDescription].filter(Boolean).join(" "),
    keywords: [...new Set([...typed, ...generated])],
  };
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
    category: product.category.name,
    keywords: productSeoCopy(product).keywords.join(", "),
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
