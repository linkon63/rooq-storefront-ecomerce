import { effectivePrice, roundMoney } from "@/utils/catalog/price";
import { toImage, type ImageResponse, type MediaImageRow } from "./content-image";

type Money = { toString(): string } | number;
const toNumber = (value: Money): number => Number(value);
const toNullableNumber = (value: Money | null): number | null => (value === null ? null : Number(value));

export type DiscountTypeValue = "percentage" | "fixed";
export type ActiveStatusValue = "active" | "inactive";

export type ProductDiscountRow = {
  id: string;
  name: string;
  type: DiscountTypeValue;
  value: Money;
  startDate: Date | null;
  endDate: Date | null;
  status: ActiveStatusValue;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductDiscountResponse = Omit<ProductDiscountRow, "value"> & { value: number };

export function toProductDiscountResponse(row: ProductDiscountRow): ProductDiscountResponse {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    value: toNumber(row.value),
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Product row produced by `discountProductSelect` (lib/server/product-discounts/select.ts). */
export type DiscountProductRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: Money;
  compareAtPrice: Money | null;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string } | null;
  media: { media: MediaImageRow }[];
  variants: { id: string; sku: string; price: Money | null; compareAtPrice: Money | null; stock: number; isActive: boolean }[];
};

export type DiscountProductResponse = {
  id: string;
  name: string;
  slug: string;
  status: string;
  price: number;
  compareAtPrice: number | null;
  image: ImageResponse | null;
  brand: DiscountProductRow["brand"];
  category: DiscountProductRow["category"];
  /** Active variants, cheapest first, with the price actually charged. */
  variants: { id: string; sku: string; price: number; compareAtPrice: number | null; stock: number; isActive: boolean }[];
};

export function toDiscountProduct(row: DiscountProductRow): DiscountProductResponse {
  const base = { price: toNumber(row.price) };
  const variants = row.variants
    .map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: effectivePrice({ price: toNullableNumber(variant.price), compareAtPrice: null }, base),
      compareAtPrice: toNullableNumber(variant.compareAtPrice),
      stock: variant.stock,
      isActive: variant.isActive,
    }))
    .sort((a, b) => a.price - b.price);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    price: base.price,
    compareAtPrice: toNullableNumber(row.compareAtPrice),
    image: toImage(row.media[0]?.media),
    brand: row.brand,
    category: row.category,
    variants,
  };
}

/** The cheapest price a product sells at (its variants, or the base price when it has none). */
export function lowestSellingPrice(product: { price: number; variantPrices: (number | null)[] }): number {
  if (product.variantPrices.length === 0) return product.price;
  return Math.min(...product.variantPrices.map((price) => price ?? product.price));
}

/** Products a fixed amount off would push to (or below) zero — the old validateFixedDiscountValue. */
export function fixedDiscountViolations(
  value: number,
  products: readonly { productId: string; lowestPrice: number }[],
): { productId: string; lowestPrice: number }[] {
  return products.filter((product) => product.lowestPrice < value).map((p) => ({ ...p, lowestPrice: roundMoney(p.lowestPrice) }));
}

/** True when `end` is not after `start` (both optional). */
export function isInvalidWindow(start: Date | null | undefined, end: Date | null | undefined): boolean {
  return Boolean(start && end && end.getTime() <= start.getTime());
}

export type ProductDiscountDetailRow = ProductDiscountRow & {
  products: { discountId: string; productId: string; createdAt: Date; product: DiscountProductRow }[];
};

export type ProductDiscountDetailResponse = ProductDiscountResponse & {
  products: { discountId: string; productId: string; createdAt: Date; product: DiscountProductResponse }[];
};

export function toProductDiscountDetail(row: ProductDiscountDetailRow): ProductDiscountDetailResponse {
  return {
    ...toProductDiscountResponse(row),
    products: row.products.map((link) => ({
      discountId: link.discountId,
      productId: link.productId,
      createdAt: link.createdAt,
      product: toDiscountProduct(link.product),
    })),
  };
}
