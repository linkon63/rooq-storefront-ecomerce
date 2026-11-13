"use client";

import { useEffect, useRef } from "react";
import { checkoutToken, saveAbandonedCart } from "@/lib/storefront/abandoned-cart";
import type { AbandonedCartInput } from "@/types/commerce/abandoned-cart";
import type { CartLine, ShippingAddressInput } from "@/types/storefront/commerce";
import { isValidPhone } from "@/utils/storefront/forms";
import { normalizeBdPhone } from "@/utils/phone";

/** Wait for a pause in typing before saving. */
const SAVE_DELAY_MS = 1500;

/**
 * Abandoned-cart capture: as soon as checkout has a name and a valid phone,
 * the cart and contact are saved (and refreshed as they change), so the shop
 * can follow up if the order is never placed. Unchanged data is not resent.
 */
export function useAbandonedCart(lines: CartLine[], contact: ShippingAddressInput) {
  const lastSent = useRef("");
  const fullName = contact.fullName.trim();
  const phone = normalizeBdPhone(contact.phone);
  const email = contact.email?.trim() || undefined;
  const city = contact.city.trim() || undefined;

  useEffect(() => {
    if (!fullName || !isValidPhone(phone) || lines.length === 0) return;
    const items = lines.map((line) => ({
      variantId: line.variantId,
      name: line.name,
      sku: line.sku,
      image: line.image,
      color: line.colorName,
      size: line.sizeLabel,
      price: line.price,
      quantity: line.quantity,
    }));
    const timer = window.setTimeout(() => {
      const token = checkoutToken();
      if (!token) return;
      const payload: AbandonedCartInput = { token, fullName, phone, email, city, items };
      const key = JSON.stringify(payload);
      if (key === lastSent.current) return;
      lastSent.current = key;
      void saveAbandonedCart(payload);
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [lines, fullName, phone, email, city]);
}
