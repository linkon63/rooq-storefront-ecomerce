import type { Department, ProductStatus } from "@/lib/generated/prisma/enums";
import { discountPercent, isOnSale } from "@/utils/catalog/price";
import { bestDiscount, salePricing, type DiscountRule } from "@/utils/catalog/discount";
import { lowStockCount } from "@/utils/catalog/stock";
import { compareSizes } from "@/utils/catalog/sizes";
import { isNewArrival } from "@/utils/catalog/dates";
import {
  toColorRef,
  toNamedRef,
  toNum,
  toNumOrNull,
  toSizeRef,
  type ColorRef,
  type DecimalLike,
  type Image,
  type NamedRef,
  type SizeRef,
} from "./catalog-refs";
import { cardImages, colorSwatchImage, type GalleryRow } from "./product-gallery";

export type CardVariantRow = {
  id: string;
  colorId: string;
  sizeId: string;
  stock: number;
  lowStockThreshold: number;
  isDefault: boolean;
  isActive: boolean;
  position: number;
  color: ColorRef;
  size: SizeRef;
};

export type ProductCardSource = {
  id: string;
  slug: string;
  name: string;
  styleCode: string | null;
  status: ProductStatus;
  department: Department;
  price: DecimalLike;
  compareAtPrice: DecimalLike | null;
  ratingAvg: DecimalLike;
  ratingCount: number;
  isFeatured: boolean;
  publishedAt: Date | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  brand: NamedRef;
  category: NamedRef;
  tags: { name: string; slug: string }[];
  media: GalleryRow[];
  variants: CardVariantRow[];
  discounts: { discount: { id: string; type: "percentage" | "fixed"; value: DecimalLike } }[];
};

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  brand: NamedRef;
  category: NamedRef;
  department: Department;
  price: number;
  compareAtPrice: number | null;
  isOnSale: boolean;
  discountPercent: number;
  discount: DiscountRule | null;
  image: Image | null;
  hoverImage: Image | null;
  colors: (ColorRef & { image: Image | null })[];
  sizes: (SizeRef & { inStock: boolean })[];
  defaultVariantId: string | null;
  inStock: boolean;
  lowStockCount: number | null;
  ratingAvg: number;
  ratingCount: number;
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
};

export type ProductCardAdmin = ProductCard & {
  status: ProductStatus;
  styleCode: string | null;
  archivedAt: Date | null;
  variantCount: number;
  totalStock: number;
  lowStockVariantCount: number;
  createdAt: Date;
  updatedAt: Date;
};

/** Best active product discount as plain numbers. */
export function pickDiscount(price: number, rows: ProductCardSource["discounts"]): DiscountRule | null {
  const rules = rows.map(({ discount }) => ({ id: discount.id, type: discount.type, value: toNum(discount.value) }));
  return bestDiscount(price, rules);
}

function uniqueBy<T, K>(items: readonly T[], key: (item: T) => K): T[] {
  const seen = new Set<K>();
  return items.filter((item) => (seen.has(key(item)) ? false : (seen.add(key(item)), true)));
}

export function toProductCard(row: ProductCardSource, now: Date): ProductCard {
  const variants = row.variants.filter((variant) => variant.isActive);
  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0] ?? null;
  const basePrice = toNum(row.price);
  const discount = pickDiscount(basePrice, row.discounts);
  const pricing = salePricing(basePrice, toNumOrNull(row.compareAtPrice), discount);
  const totalStock = variants.reduce((sum, variant) => sum + Math.max(variant.stock, 0), 0);
  const threshold = defaultVariant?.lowStockThreshold ?? 0;

  const colors = uniqueBy(variants, (variant) => variant.colorId).map((variant) => ({
    ...toColorRef(variant.color),
    image: colorSwatchImage(row.media, variant.colorId),
  }));
  const sizes = uniqueBy(variants, (variant) => variant.sizeId)
    .map((variant) => ({
      ...toSizeRef(variant.size),
      inStock: variants.some((other) => other.sizeId === variant.sizeId && other.stock > 0),
    }))
    .sort(compareSizes);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: toNamedRef(row.brand),
    category: toNamedRef(row.category),
    department: row.department,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    isOnSale: isOnSale(pricing.price, pricing.compareAtPrice),
    discountPercent: discountPercent(pricing.price, pricing.compareAtPrice),
    discount,
    ...cardImages(row.media, defaultVariant?.colorId ?? null),
    colors,
    sizes,
    defaultVariantId: defaultVariant?.id ?? null,
    inStock: totalStock > 0,
    lowStockCount: lowStockCount(totalStock, threshold),
    ratingAvg: toNum(row.ratingAvg),
    ratingCount: row.ratingCount,
    tags: row.tags.map((tag) => tag.name),
    isNew: isNewArrival(row.publishedAt, now),
    isFeatured: row.isFeatured,
  };
}

export function toProductCardAdmin(row: ProductCardSource, now: Date): ProductCardAdmin {
  return {
    ...toProductCard(row, now),
    status: row.status,
    styleCode: row.styleCode,
    archivedAt: row.archivedAt,
    variantCount: row.variants.length,
    totalStock: row.variants.reduce((sum, variant) => sum + variant.stock, 0),
    lowStockVariantCount: row.variants.filter((v) => v.isActive && lowStockCount(v.stock, v.lowStockThreshold) !== null).length,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
