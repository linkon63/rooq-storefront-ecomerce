"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createAddress } from "@/lib/address-api";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { emptyBag } from "@/lib/store/slices/cart-thunks";
import { useAppDispatch } from "@/lib/store/hooks";
import { placeGuestOrder, placeOrder } from "@/lib/storefront/orders-api";
import { rememberLastOrder } from "@/lib/storefront/last-order";
import type { CartLine, DeliveryZoneKey, ShippingAddressInput } from "@/types/storefront/commerce";
import { errorText } from "@/utils/api-error";
import { addressProblem, cleanAddress } from "@/utils/storefront/forms";

type PlaceOrderInput = {
  lines: CartLine[];
  zone: DeliveryZoneKey;
  couponCode: string | null;
  signedIn: boolean;
  /** Saved address id, or null to use `address`. */
  addressId: string | null;
  address: ShippingAddressInput;
};

/**
 * Places the order: saves a new address first for signed-in shoppers, then
 * POST /orders (or /orders/guest), empties the bag and opens the confirmation.
 * The API prices the order itself; the client only sends variants and the zone.
 */
export function usePlaceOrder() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  async function submit(input: PlaceOrderInput) {
    if (input.lines.length === 0) return setError(ERROR_MESSAGES.storefront.checkoutEmpty);
    if (!input.addressId) {
      const problem = addressProblem(input.address);
      if (problem) return setError(problem);
    }
    setPlacing(true);
    setError(null);
    const items = input.lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity }));
    const couponCode = input.couponCode ?? undefined;
    try {
      const address = cleanAddress(input.address);
      let order;
      if (input.signedIn) {
        const addressId = input.addressId ?? (await createAddress({ ...address, isDefault: true })).id;
        order = await placeOrder({ addressId, items, deliveryZone: input.zone, couponCode });
      } else {
        order = await placeGuestOrder({ address, items, deliveryZone: input.zone, couponCode });
      }
      rememberLastOrder(order);
      await dispatch(emptyBag());
      router.push(`/confirmation?order=${encodeURIComponent(order.orderNumber)}`);
    } catch (caught) {
      setError(errorText(caught, ERROR_MESSAGES.order.placeFailed));
      setPlacing(false);
    }
  }

  return { submit, error, placing };
}
