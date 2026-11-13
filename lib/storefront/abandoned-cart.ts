import { apiRequest } from "@/lib/api";
import type { AbandonedCartInput } from "@/types/commerce/abandoned-cart";

/** This browser's id for the checkout in progress; a new one starts after each order. */
const TOKEN_KEY = "rooq.checkoutToken.v1";

export function checkoutToken(): string | null {
  try {
    const existing = window.localStorage.getItem(TOKEN_KEY);
    if (existing) return existing;
    const token = crypto.randomUUID();
    window.localStorage.setItem(TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

export function forgetCheckoutToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing stored, nothing to forget.
  }
}

/** Saves the checkout so far; best effort, never in the shopper's way. */
export async function saveAbandonedCart(input: AbandonedCartInput): Promise<void> {
  await apiRequest<unknown>("/abandoned-carts", { method: "POST", body: input }).catch(() => undefined);
}
