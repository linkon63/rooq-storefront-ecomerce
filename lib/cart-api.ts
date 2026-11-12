import { apiRequest } from "@/lib/api";
import type { CouponQuote, ServerCart } from "@/types/storefront/commerce";
import { toAmount } from "@/utils/storefront/money";

/** Signed-in bag (by variant), wishlist (by product) and coupon quotes. */

export function fetchCart(): Promise<ServerCart> {
  return apiRequest<ServerCart>("/cart");
}

export function addCartItem(variantId: string, quantity: number): Promise<ServerCart> {
  return apiRequest<ServerCart>("/cart/items", { method: "POST", body: { variantId, quantity } });
}

export function updateCartItem(itemId: string, quantity: number): Promise<ServerCart> {
  return apiRequest<ServerCart>(`/cart/items/${encodeURIComponent(itemId)}`, { method: "PATCH", body: { quantity } });
}

export function removeCartItem(itemId: string): Promise<ServerCart> {
  return apiRequest<ServerCart>(`/cart/items/${encodeURIComponent(itemId)}`, { method: "DELETE" });
}

export function clearServerCart(): Promise<unknown> {
  return apiRequest("/cart/clear", { method: "DELETE" });
}

export function fetchWishlist(): Promise<unknown[]> {
  return apiRequest<unknown>("/wishlist").then((payload) => {
    if (Array.isArray(payload)) return payload;
    const data = (payload as { data?: unknown } | null)?.data;
    return Array.isArray(data) ? data : [];
  });
}

export function addWishlistItem(productId: string): Promise<unknown> {
  return apiRequest("/wishlist", { method: "POST", body: { productId } });
}

export function removeWishlistItem(productId: string): Promise<unknown> {
  return apiRequest(`/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
}

type CouponApplyResponse = { discount: unknown; total: unknown; coupon?: { code?: string } };

export async function quoteCoupon(code: string, subtotal: number): Promise<CouponQuote> {
  const result = await apiRequest<CouponApplyResponse>("/coupons/apply", {
    method: "POST",
    body: { code, subtotal },
  });
  return { code: result.coupon?.code ?? code, discount: toAmount(result.discount), total: toAmount(result.total) };
}
