import type { ColorRef, SizeRef } from "@/utils/mappers/catalog-refs";

/** The variant a cart line holds, priced with today's offers. */
export type CartVariantResponse = {
  id: string;
  sku: string;
  /** What the shopper pays per unit now (variant override → product price → offer). */
  price: number;
  /** Struck-through "was" price, only when higher than `price`. */
  compareAtPrice: number | null;
  inStock: boolean;
  stock: number;
  /** "Only 3 left" — null when stock is healthy or zero. */
  lowStockCount: number | null;
  /** False when the variant or its product is no longer sold. */
  isAvailable: boolean;
  color: ColorRef;
  size: SizeRef;
  product: { id: string; slug: string; name: string; image: string | null };
};

export type CartItemResponse = {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  /** price × quantity */
  lineTotal: number;
  createdAt: string;
  updatedAt: string;
  variant: CartVariantResponse;
};

export type CartResponse = {
  id: string;
  userId: string | null;
  items: CartItemResponse[];
  /** Σ price × qty — what the cart costs today, offers applied. */
  subtotal: number;
  /** Σ (compareAtPrice ?? price) × qty. */
  listSubtotal: number;
  /** listSubtotal − subtotal. */
  savings: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};
