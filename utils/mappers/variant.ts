import { effectivePrice } from "@/utils/catalog/price";
import { salePricing, type DiscountRule } from "@/utils/catalog/discount";
import { lowStockCount } from "@/utils/catalog/stock";
import { toColorRef, toNumOrNull, toSizeRef, type ColorRef, type DecimalLike, type SizeRef } from "./catalog-refs";

export type VariantRow = {
  id: string;
  sku: string;
  barcode: string | null;
  colorId: string;
  sizeId: string;
  price: DecimalLike | null;
  compareAtPrice: DecimalLike | null;
  costPrice: DecimalLike | null;
  stock: number;
  lowStockThreshold: number;
  isDefault: boolean;
  isActive: boolean;
  position: number;
  color: ColorRef;
  size: SizeRef;
};

/** Product-level prices the variant falls back on (numbers). */
export type PriceContext = { price: number; compareAtPrice: number | null; discount: DiscountRule | null };

export type VariantPublic = {
  id: string;
  sku: string;
  colorId: string;
  sizeId: string;
  price: number;
  compareAtPrice: number | null;
  inStock: boolean;
  lowStockCount: number | null;
  isDefault: boolean;
};

export type VariantAdmin = VariantPublic & {
  barcode: string | null;
  priceOverride: number | null;
  compareAtOverride: number | null;
  costPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  position: number;
  color: ColorRef;
  size: SizeRef;
};

/** Effective selling and compare-at price for one variant. */
export function variantPricing(row: Pick<VariantRow, "price" | "compareAtPrice">, ctx: PriceContext) {
  const override = { price: toNumOrNull(row.price), compareAtPrice: toNumOrNull(row.compareAtPrice) };
  const base = effectivePrice(override, ctx);
  return salePricing(base, override.compareAtPrice ?? ctx.compareAtPrice, ctx.discount);
}

export function toVariantPublic(row: VariantRow, ctx: PriceContext): VariantPublic {
  const pricing = variantPricing(row, ctx);
  return {
    id: row.id,
    sku: row.sku,
    colorId: row.colorId,
    sizeId: row.sizeId,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    inStock: row.stock > 0,
    lowStockCount: lowStockCount(row.stock, row.lowStockThreshold),
    isDefault: row.isDefault,
  };
}

export function toVariantAdmin(row: VariantRow, ctx: PriceContext): VariantAdmin {
  return {
    ...toVariantPublic(row, ctx),
    barcode: row.barcode,
    priceOverride: toNumOrNull(row.price),
    compareAtOverride: toNumOrNull(row.compareAtPrice),
    costPrice: toNumOrNull(row.costPrice),
    stock: row.stock,
    lowStockThreshold: row.lowStockThreshold,
    isActive: row.isActive,
    position: row.position,
    color: toColorRef(row.color),
    size: toSizeRef(row.size),
  };
}
