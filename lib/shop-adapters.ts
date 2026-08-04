/**
 * Maps our NestJS storefront payloads onto the shapes the cap-1 components
 * were written against, so those components can be reused unmodified.
 */

import type { ShopCategory, ShopProduct } from "./shop-api";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";
import type { ProductItem } from "@/types/shop";

/** cap-1 product card data, built from a storefront product. */
export function toCapProduct(product: ShopProduct): Product {
  const price = product.price;
  const originalPrice = product.originalPrice ?? 0;
  const hasDiscount = originalPrice > price && price > 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: "",
    image: product.image,
    media: product.image ? [{ original_url: product.image }] : [],
    price,
    originalPrice: hasDiscount ? originalPrice : undefined,
    discount: hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    brand: product.team,
    category: product.category,
    is_active: true,
    status: "active",
  };
}

export function toCapProducts(products: ShopProduct[]): Product[] {
  return products.map(toCapProduct);
}

/** cap-1 category, built from a storefront category (recursive over children). */
export function toCapCategory(category: ShopCategory): Category {
  return {
    id: category.id,
    name: category.name,
    is_active: true,
    media: category.imageUrl ? [{ original_url: category.imageUrl }] : [],
    children: category.children?.map(toCapCategory),
  };
}

export function toCapCategories(categories: ShopCategory[]): Category[] {
  return categories.map(toCapCategory);
}

/**
 * The storefront slug is what our product route resolves by, so keep a lookup
 * from id → slug for components that only carry the id.
 */
export function buildSlugLookup(products: ShopProduct[]): Record<string, string> {
  return Object.fromEntries(products.map((p) => [p.id, p.slug]));
}

/** Search-result shape used by the header search popup. */
export function toProductItems(products: ShopProduct[]): ProductItem[] {
  return products.map((product) => {
    const price = product.price;
    const originalPrice = product.originalPrice ?? 0;
    const hasDiscount = originalPrice > price && price > 0;

    return {
      id: product.id,
      name: product.name,
      description: "",
      thumbnail: product.image,
      price_min: price,
      price_max: hasDiscount ? originalPrice : price,
      price,
      brand: product.team,
      category: product.category,
      category_name: product.category,
      categories: product.category ? [product.category] : [],
      option_values: [],
      total_stock_count: 0,
      discount: hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    };
  });
}
