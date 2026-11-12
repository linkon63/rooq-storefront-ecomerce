import type { ProductStatus } from "@/lib/generated/prisma/enums";
import { roundMoney } from "@/utils/catalog/price";
import { lowStockCount } from "@/utils/catalog/stock";
import { toColorRef, toNum as toNumber, toNumOrNull as toNumberOrNull, toSizeRef, type ColorRef, type DecimalLike, type SizeRef } from "./catalog-refs";
import { cardImages, type GalleryRow } from "./product-gallery";
import { pickDiscount } from "./product-card";
import { variantPricing } from "./variant";
import type { CartItemResponse, CartResponse, CartVariantResponse } from "@/types/commerce/cart";

export type CartVariantRow = {
  id: string;
  sku: string;
  isActive: boolean;
  stock: number;
  lowStockThreshold: number;
  price: DecimalLike | null;
  compareAtPrice: DecimalLike | null;
  colorId: string;
  color: ColorRef;
  size: SizeRef;
  product: {
    id: string;
    slug: string;
    name: string;
    status: ProductStatus;
    archivedAt: Date | null;
    price: DecimalLike;
    compareAtPrice: DecimalLike | null;
    discounts: { discount: { id: string; type: "percentage" | "fixed"; value: DecimalLike } }[];
    media: GalleryRow[];
  };
};

export type CartItemRow = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  variant: CartVariantRow;
};

export type CartRow = {
  id: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItemRow[];
};

/** A variant priced exactly as the product page quotes it (override → base → best offer). */
export function toCartVariant(row: CartVariantRow): CartVariantResponse {
  const productPrice = toNumber(row.product.price);
  const pricing = variantPricing(row, {
    price: productPrice,
    compareAtPrice: toNumberOrNull(row.product.compareAtPrice),
    discount: pickDiscount(productPrice, row.product.discounts),
  });
  return {
    id: row.id,
    sku: row.sku,
    price: pricing.price,
    compareAtPrice: pricing.compareAtPrice,
    inStock: row.stock > 0,
    stock: row.stock,
    lowStockCount: lowStockCount(row.stock, row.lowStockThreshold),
    isAvailable: row.isActive && row.product.status === "active" && row.product.archivedAt === null,
    color: toColorRef(row.color),
    size: toSizeRef(row.size),
    product: {
      id: row.product.id,
      slug: row.product.slug,
      name: row.product.name,
      image: cardImages(row.product.media, row.colorId).image?.url ?? null,
    },
  };
}

export function toCartItem(row: CartItemRow): CartItemResponse {
  const variant = toCartVariant(row.variant);
  return {
    id: row.id,
    cartId: row.cartId,
    variantId: row.variantId,
    quantity: row.quantity,
    lineTotal: roundMoney(variant.price * row.quantity),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    variant,
  };
}

export function toCartResponse(row: CartRow): CartResponse {
  const items = row.items.map(toCartItem);
  let subtotal = 0;
  let listSubtotal = 0;
  let itemCount = 0;
  for (const item of items) {
    subtotal += item.lineTotal;
    listSubtotal += (item.variant.compareAtPrice ?? item.variant.price) * item.quantity;
    itemCount += item.quantity;
  }
  return {
    id: row.id,
    userId: row.userId,
    items,
    subtotal: roundMoney(subtotal),
    listSubtotal: roundMoney(listSubtotal),
    savings: roundMoney(Math.max(listSubtotal - subtotal, 0)),
    itemCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
