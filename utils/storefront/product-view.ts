import type { ProductDetail } from "@/types/storefront/catalog";

/**
 * Exactly the ProductDetail fields the client product view reads. The API
 * answer also carries the legacy `media` list and the rails (rendered on the
 * server), which would otherwise be serialised to the browser a second time.
 */
export function clientProduct(product: ProductDetail): ProductDetail {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    styleCode: product.styleCode,
    shortDescription: product.shortDescription,
    description: null,
    status: product.status,
    brand: product.brand,
    category: product.category,
    breadcrumbs: [],
    department: product.department,
    material: product.material,
    composition: product.composition,
    careInstructions: null,
    fit: product.fit,
    season: product.season,
    occasions: product.occasions,
    pattern: product.pattern,
    modelInfo: product.modelInfo,
    features: [],
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    isOnSale: product.isOnSale,
    discountPercent: product.discountPercent,
    colors: product.colors,
    sharedImages: product.sharedImages,
    sizes: product.sizes,
    variants: product.variants,
    defaultVariantId: product.defaultVariantId,
    sizeChart: product.sizeChart,
    attributes: [],
    tags: [],
    collections: [],
    rating: product.rating,
    delivery: product.delivery,
    related: [],
    completeTheLook: [],
    seo: { metaTitle: null, metaDescription: null, metaKeywords: null },
  };
}
