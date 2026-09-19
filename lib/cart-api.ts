import { getCustomerToken } from "@/lib/storefront-api";
import { resolveImageUrl, type Product } from "@/lib/admin-api";
import { resolveVariantPricing } from "@/lib/shop-api";
import type { BackendCartResponse, BackendCartItem, CartItem } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCustomerToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** The variant's attributes as { "Weight": "500 g" }, whichever shape the API sent. */
function variantAttributes(raw: BackendCartItem['variant']['attributes']): Record<string, string> {
  if (!raw) return {};
  if (!Array.isArray(raw)) return raw;
  const map: Record<string, string> = {};
  for (const row of raw) {
    const name = row.attributeValue?.attribute?.name;
    const value = row.attributeValue?.value;
    if (name && value) map[name] = value;
  }
  return map;
}

export function mapBackendCartItem(item: BackendCartItem): CartItem {
  const p = item.variant.product;
  const featured = p.media?.find((m) => m.isFeatured);
  const first = p.media?.[0];
  const attributes = variantAttributes(item.variant.attributes);

  // GET /cart hands back the raw variant price — it does not apply the product
  // offers that GET /products does. `repriceCartItems` fills the gap from the
  // catalogue right after; this is the honest starting point until it lands.
  const listPrice = Number(item.variant.price);
  const discounted = item.variant.discountedPrice != null ? Number(item.variant.discountedPrice) : 0;
  const hasOffer = discounted > 0 && discounted < listPrice;

  // Once the catalogue has priced this variant, use that straight away. Without
  // it every quantity change repainted the line at the raw price and then back
  // at the offer price a moment later — rows blinking in and out, which read
  // as the whole cart page shaking.
  const known = variantPricing.get(item.variantId);
  const knownOriginal =
    known?.originalPrice && known.originalPrice > known.price ? known.originalPrice : undefined;

  return {
    id: item.id,
    slug: p.slug,
    name: p.name,
    price: known ? known.price : hasOffer ? discounted : listPrice,
    originalPrice: known ? knownOriginal : hasOffer ? listPrice : undefined,
    image: resolveImageUrl(featured?.media.url ?? first?.media.url ?? ""),
    color: attributes.Color ?? attributes.Colour ?? attributes.color ?? '',
    size: attributes.Size ?? attributes.size ?? Object.values(attributes).join(' / '),
    quantity: item.quantity,
    productId: p.id,
    variantId: item.variantId,
    attributes,
    ...attributes,
  };
}

export function mapBackendCart(response: BackendCartResponse): CartItem[] {
  return response.items.map(mapBackendCartItem);
}

export function getCart(): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>("/cart");
}

export function addCartItem(
  variantId: string,
  quantity: number,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>("/cart/items", {
    method: "POST",
    body: JSON.stringify({ variantId, quantity }),
  });
}

export function updateCartItemQuantity(
  cartItemId: string,
  quantity: number,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(
  cartItemId: string,
): Promise<BackendCartResponse> {
  return authFetch<BackendCartResponse>(`/cart/items/${cartItemId}`, {
    method: "DELETE",
  });
}

// ─── Live offer pricing ──────────────────────────────────────────────────────
// The cart is not the authority on price. A guest cart is whatever localStorage
// held when the line was added, and GET /cart returns the plain variant price
// with no product discount applied — so both can show yesterday's money. The
// catalogue *is* the authority (GET /products/:id enriches every variant with
// `discountedPrice`), and every cart is re-priced against it before the shopper
// is shown a total.

type VariantPricing = { price: number; originalPrice?: number };

/** variantId → what that variant costs today. Lives for the page session. */
const variantPricing = new Map<string, VariantPricing>();
/** In-flight product loads, so a cart with three lines of one product fetches once. */
const productLoads = new Map<string, Promise<void>>();

async function fetchCatalogueProduct(key: string, bySlug: boolean): Promise<Product | null> {
  try {
    const path = bySlug ? `/products/slug/${encodeURIComponent(key)}` : `/products/${key}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

/**
 * Load one product's variant prices into the cache.
 *
 * A lookup that came back with nothing is dropped from the in-flight map so a
 * blip on the network is retried on the next pass rather than leaving the cart
 * stuck at its stale price for the rest of the session.
 */
function loadProductPricing(key: string, bySlug: boolean): Promise<void> {
  const cacheKey = `${bySlug ? "slug" : "id"}:${key}`;
  const existing = productLoads.get(cacheKey);
  if (existing) return existing;

  const load = fetchCatalogueProduct(key, bySlug).then((product) => {
    const variants = product?.variants ?? [];
    if (!variants.length) {
      productLoads.delete(cacheKey);
      return;
    }
    for (const variant of variants) {
      variantPricing.set(variant.id, resolveVariantPricing(variant, product ?? undefined));
    }
  });

  productLoads.set(cacheKey, load);
  return load;
}

/**
 * Re-price cart lines against the catalogue.
 *
 * Returns `null` when nothing moved, which is what stops the provider's effect
 * from looping: an unchanged cart never triggers another render.
 */
export async function repriceCartItems(items: CartItem[]): Promise<CartItem[] | null> {
  const unpriced = items.filter((item) => item.variantId && !variantPricing.has(item.variantId));

  // A line added from the wishlist carries no productId, so fall back to slug —
  // GET /products/slug/:slug enriches its variants the same way.
  const byId = new Set<string>();
  const bySlug = new Set<string>();
  for (const item of unpriced) {
    if (item.productId) byId.add(item.productId);
    else if (item.slug) bySlug.add(item.slug);
  }

  if (byId.size || bySlug.size) {
    await Promise.all([
      ...[...byId].map((id) => loadProductPricing(id, false)),
      ...[...bySlug].map((slug) => loadProductPricing(slug, true)),
    ]);
  }

  let changed = false;
  const repriced = items.map((item) => {
    const priced = item.variantId ? variantPricing.get(item.variantId) : undefined;
    // A variant the catalogue no longer lists keeps the price it was added at.
    if (!priced) return item;

    const originalPrice = priced.originalPrice && priced.originalPrice > priced.price
      ? priced.originalPrice
      : undefined;
    if (item.price === priced.price && item.originalPrice === originalPrice) return item;

    changed = true;
    return { ...item, price: priced.price, originalPrice };
  });

  return changed ? repriced : null;
}
