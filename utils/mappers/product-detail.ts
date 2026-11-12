import type { CollectionType, Department, Fit, Occasion, Pattern, ProductStatus, Season } from "@/lib/generated/prisma/enums";
import { discountPercent, isOnSale } from "@/utils/catalog/price";
import { salePricing, type DiscountRule } from "@/utils/catalog/discount";
import { compareSizes } from "@/utils/catalog/sizes";
import type { FitSummary } from "@/utils/catalog/fit-summary";
import { mediaSrc } from "@/utils/media-url";
import { toColorRef, toImage, toNumOrNull, toSizeRef, type ColorRef, type DecimalLike, type Image, type MediaRow, type SizeRef } from "./catalog-refs";
import { pickDiscount, type ProductCard, type ProductCardSource } from "./product-card";
import { toVariantAdmin, toVariantPublic, type VariantAdmin, type VariantPublic, type VariantRow } from "./variant";
import type { SizeChart } from "./size-chart";

export type DetailMediaRow = { id: string; mediaId: string; colorId: string | null; position: number; isPrimary: boolean; media: MediaRow };

export type ProductDetailSource = {
  id: string; slug: string; name: string; styleCode: string | null; shortDescription: string | null; description: string | null;
  status: ProductStatus; isFeatured: boolean; price: DecimalLike; compareAtPrice: DecimalLike | null; costPrice: DecimalLike | null;
  department: Department; material: string | null; composition: string | null; careInstructions: string | null;
  fit: Fit | null; season: Season | null; occasions: Occasion[]; pattern: Pattern | null; modelInfo: string | null; features: string[];
  metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null;
  ratingAvg: DecimalLike; ratingCount: number; soldCount: number;
  brandId: string; categoryId: string; unitId: string | null; supplierId: string | null; sizeChartId: string | null;
  publishedAt: Date | null; archivedAt: Date | null; createdAt: Date; updatedAt: Date;
  brand: { id: string; slug: string; name: string; logoMedia: MediaRow | null };
  category: { id: string; slug: string; name: string };
  unit: { id: string; name: string; code: string } | null;
  supplier: { id: string; name: string } | null;
  tags: { id: string; slug: string; name: string }[];
  collections: { collection: { id: string; slug: string; name: string; type: CollectionType } }[];
  attributeValues: { attributeValue: { id: string; value: string; attribute: { id: string; name: string } } }[];
  media: DetailMediaRow[];
  variants: VariantRow[];
  discounts: ProductCardSource["discounts"];
};

export type DeliveryInfo = { chargeInside: number; chargeNearCity: number; chargeOutside: number; freeShippingThreshold: number | null; returnWindowDays: number };
export type GalleryImage = Image & { position: number };
export type LegacyMedia = { id: string; mediaId: string; url: string; alt: string | null; colorId: string | null; position: number; isPrimary: boolean };

export type ProductDetailExtras = {
  admin: boolean;
  breadcrumbs: { slug: string; name: string }[];
  sizeChart: SizeChart | null;
  rating: { average: number; count: number; fit: FitSummary };
  delivery: DeliveryInfo;
  related: ProductCard[];
  completeTheLook: ProductCard[];
};

function galleryImage(row: DetailMediaRow): GalleryImage | null {
  const image = toImage(row.media);
  return image ? { ...image, position: row.position } : null;
}

function sortGallery(rows: DetailMediaRow[]): DetailMediaRow[] {
  return [...rows].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.position - b.position);
}

export function toLegacyMedia(row: DetailMediaRow): LegacyMedia {
  return { id: row.id, mediaId: row.mediaId, url: mediaSrc(row.media) ?? "", alt: row.media.alt, colorId: row.colorId, position: row.position, isPrimary: row.isPrimary };
}

function uniqueColors(variants: VariantRow[]): ColorRef[] {
  const map = new Map<string, ColorRef>();
  for (const variant of variants) if (!map.has(variant.colorId)) map.set(variant.colorId, toColorRef(variant.color));
  return [...map.values()];
}

function uniqueSizes(variants: VariantRow[]): SizeRef[] {
  const map = new Map<string, SizeRef>();
  for (const variant of variants) if (!map.has(variant.sizeId)) map.set(variant.sizeId, toSizeRef(variant.size));
  return [...map.values()].sort(compareSizes);
}

export function productDiscount(row: Pick<ProductDetailSource, "price" | "discounts">): DiscountRule | null {
  return pickDiscount(toNumOrNull(row.price) ?? 0, row.discounts);
}

export function toProductDetail(row: ProductDetailSource, extras: ProductDetailExtras) {
  const basePrice = toNumOrNull(row.price) ?? 0;
  const discount = productDiscount(row);
  const pricing = salePricing(basePrice, toNumOrNull(row.compareAtPrice), discount);
  const priceCtx = { price: basePrice, compareAtPrice: toNumOrNull(row.compareAtPrice), discount };
  const sold = extras.admin ? row.variants : row.variants.filter((variant) => variant.isActive);
  const defaultVariant = sold.find((v) => v.isActive && v.isDefault) ?? sold.find((v) => v.isActive) ?? null;
  const gallery = sortGallery(row.media);

  const variants: (VariantPublic | VariantAdmin)[] = sold.map((variant) =>
    extras.admin ? toVariantAdmin(variant, priceCtx) : toVariantPublic(variant, priceCtx),
  );

  return {
    id: row.id, slug: row.slug, name: row.name, styleCode: row.styleCode,
    shortDescription: row.shortDescription, description: row.description, status: row.status, isFeatured: row.isFeatured,
    brand: { id: row.brand.id, slug: row.brand.slug, name: row.brand.name, logoUrl: mediaSrc(row.brand.logoMedia) },
    category: { id: row.category.id, slug: row.category.slug, name: row.category.name },
    breadcrumbs: extras.breadcrumbs,
    department: row.department, material: row.material, composition: row.composition, careInstructions: row.careInstructions,
    fit: row.fit, season: row.season, occasions: row.occasions, pattern: row.pattern, modelInfo: row.modelInfo, features: row.features,
    price: pricing.price, compareAtPrice: pricing.compareAtPrice,
    isOnSale: isOnSale(pricing.price, pricing.compareAtPrice), discountPercent: discountPercent(pricing.price, pricing.compareAtPrice), discount,
    colors: uniqueColors(sold).map((color) => ({
      ...color,
      images: gallery.filter((m) => m.colorId === color.id).flatMap((m) => galleryImage(m) ?? []),
    })),
    sharedImages: gallery.filter((m) => m.colorId === null).flatMap((m) => galleryImage(m) ?? []),
    sizes: uniqueSizes(sold),
    variants,
    defaultVariantId: defaultVariant?.id ?? null,
    sizeChart: extras.sizeChart,
    attributes: row.attributeValues.map(({ attributeValue }) => ({ attribute: attributeValue.attribute.name, value: attributeValue.value })),
    tags: row.tags.map((tag) => ({ slug: tag.slug, name: tag.name })),
    collections: row.collections.map(({ collection }) => ({ slug: collection.slug, name: collection.name, type: collection.type })),
    rating: extras.rating,
    ratingAvg: extras.rating.average,
    ratingCount: extras.rating.count,
    delivery: extras.delivery,
    related: extras.related,
    completeTheLook: extras.completeTheLook,
    seo: { metaTitle: row.metaTitle, metaDescription: row.metaDescription, metaKeywords: row.metaKeywords },
    metaTitle: row.metaTitle, metaDescription: row.metaDescription, metaKeywords: row.metaKeywords,
    media: row.media.map(toLegacyMedia).sort((a, b) => a.position - b.position),
    publishedAt: row.publishedAt, createdAt: row.createdAt, updatedAt: row.updatedAt,
    ...(extras.admin ? adminFields(row) : {}),
  };
}

/** Ids and internals the admin editor needs to prefill its form. */
function adminFields(row: ProductDetailSource) {
  return {
    brandId: row.brandId, categoryId: row.categoryId, unitId: row.unitId, supplierId: row.supplierId, sizeChartId: row.sizeChartId,
    unit: row.unit, supplier: row.supplier, costPrice: toNumOrNull(row.costPrice), basePrice: toNumOrNull(row.price),
    baseCompareAtPrice: toNumOrNull(row.compareAtPrice), soldCount: row.soldCount, archivedAt: row.archivedAt,
    tagIds: row.tags.map((tag) => tag.id),
    attributeValueIds: row.attributeValues.map(({ attributeValue }) => attributeValue.id),
    collectionIds: row.collections.map(({ collection }) => collection.id),
  };
}

export type ProductDetail = ReturnType<typeof toProductDetail>;
