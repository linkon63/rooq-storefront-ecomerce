import { CART_MAX_QUANTITY } from "@/lib/constants/storefront";
import type { Image } from "@/types/storefront/catalog";
import type { CartLine, CartLineInput, DeliveryZoneKey, ServerCart, ServerCartItem } from "@/types/storefront/commerce";
import type { StoreSettings } from "@/types/storefront/content";
import { toAmount } from "./money";

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(CART_MAX_QUANTITY, Math.max(1, Math.round(quantity)));
}

function imageUrl(image: Image | string | null | undefined): string | null {
  if (!image) return null;
  return typeof image === "string" ? image : image.url;
}

export function cartLineFromServer(item: ServerCartItem): CartLine {
  const { variant } = item;
  return {
    id: item.id,
    variantId: item.variantId ?? variant.id,
    productId: variant.product.id,
    slug: variant.product.slug,
    name: variant.product.name,
    image: imageUrl(variant.product.image),
    sku: variant.sku,
    colorName: variant.color?.name ?? null,
    colorHex: variant.color?.hex ?? null,
    sizeLabel: variant.size?.label ?? null,
    price: toAmount(variant.price),
    compareAtPrice: variant.compareAtPrice == null ? null : toAmount(variant.compareAtPrice),
    quantity: item.quantity,
    inStock: variant.inStock !== false && variant.isAvailable !== false,
    lowStockCount: variant.lowStockCount ?? null,
  };
}

export function cartLinesFromServer(cart: ServerCart | null | undefined): CartLine[] {
  return (cart?.items ?? []).map(cartLineFromServer);
}

/** Add to a guest bag: bump the existing line for that variant or append a new one. */
export function addGuestLine(lines: readonly CartLine[], input: CartLineInput): CartLine[] {
  const quantity = clampQuantity(input.quantity ?? 1);
  const existing = lines.find((line) => line.variantId === input.variantId);
  if (existing) {
    return lines.map((line) =>
      line === existing ? { ...line, quantity: clampQuantity(line.quantity + quantity) } : line,
    );
  }
  return [...lines, { ...input, id: input.variantId, quantity }];
}

export type CartSummary = {
  count: number;
  subtotal: number;
  listSubtotal: number;
  savings: number;
};

export function summariseCart(lines: readonly CartLine[]): CartSummary {
  let count = 0;
  let subtotal = 0;
  let listSubtotal = 0;
  for (const line of lines) {
    count += line.quantity;
    subtotal += line.price * line.quantity;
    const list = line.compareAtPrice && line.compareAtPrice > line.price ? line.compareAtPrice : line.price;
    listSubtotal += list * line.quantity;
  }
  const round = (value: number) => Math.round(value * 100) / 100;
  return { count, subtotal: round(subtotal), listSubtotal: round(listSubtotal), savings: round(listSubtotal - subtotal) };
}

/** Delivery charge for a zone, free above the threshold when one is set. */
export function shippingFor(zone: DeliveryZoneKey, subtotal: number, delivery: StoreSettings["delivery"]): number {
  if (delivery.freeShippingThreshold !== null && subtotal >= delivery.freeShippingThreshold) return 0;
  if (zone === "near_city") return delivery.nearCity;
  if (zone === "outside") return delivery.outside;
  return delivery.inside;
}

/** Amount left to unlock free delivery, or null when there is no threshold / it is reached. */
export function freeShippingGap(subtotal: number, threshold: number | null): number | null {
  if (threshold === null) return null;
  const gap = Math.round((threshold - subtotal) * 100) / 100;
  return gap > 0 ? gap : null;
}
