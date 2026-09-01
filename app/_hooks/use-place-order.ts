"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/_providers/cart-provider";
import { getCustomerToken } from "@/lib/storefront-api";
import { cartTotals } from "@/lib/cart-pricing";
import type { AddressForm, DeliveryZone, OrderResult } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5010/api/v1";

export function usePlaceOrder() {
  const { items, removeItem, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);

  const placeOrder = async (
    address: AddressForm,
    extra?: {
      paymentMethod?: string;
      orderNote?: string;
      deliveryZone?: DeliveryZone;
      /** A saved address the shopper picked — skips creating a duplicate. */
      addressId?: string;
      /** Selected items chosen for checkout */
      selectedItems?: import("@/lib/types").CartItem[];
    }
  ): Promise<OrderResult> => {
    setSubmitting(true);
    const token = getCustomerToken();
    const deliveryZone = extra?.deliveryZone ?? "inside";

    const targetItems = extra?.selectedItems && extra.selectedItems.length > 0 ? extra.selectedItems : items;
    const totals = cartTotals(targetItems);

    try {
      let data: Record<string, unknown>;

      const lineItems = await Promise.all(
        targetItems.map(async (i) => {
          let variantId = i.variantId;
          if (!variantId && (i.productId || i.slug || i.name)) {
            try {
              const target = i.productId || i.slug;
              const pRes = await fetch(
                target ? `${BASE_URL}/products/${target}` : `${BASE_URL}/products?search=${encodeURIComponent(i.name)}`
              );
              if (pRes.ok) {
                const pData = await pRes.json();
                const product = Array.isArray(pData?.data) ? pData.data[0] : pData;
                const defaultVar = product?.variants?.find((v: { isDefault?: boolean }) => v.isDefault) ?? product?.variants?.[0];
                if (defaultVar?.id) {
                  variantId = defaultVar.id;
                }
              }
            } catch {
              /* silent catch */
            }
          }
          if (!variantId) throw new Error(`Missing variant for "${i.name}". Please remove and re-add the item.`);
          return { variantId, quantity: i.quantity };
        })
      );

      if (token) {
        // A saved address is used as-is; only a freshly typed one is stored.
        let addressId = extra?.addressId;

        if (!addressId) {
          const addressRes = await fetch(`${BASE_URL}/addresses`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || undefined,
              city: address.city || address.state || "Dhaka",
              state: address.state || "Dhaka",
              postalCode: address.postalCode || "",
              country: address.country || "Bangladesh",
              isDefault: true,
            }),
          });

          if (!addressRes.ok) {
            const err = await addressRes.json().catch(() => ({}));
            throw new Error((err as { message?: string }).message ?? "Failed to save address");
          }

          addressId = (await addressRes.json() as { id: string }).id;
        }

        const orderRes = await fetch(`${BASE_URL}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            addressId,
            deliveryZone,
            items: lineItems,
          }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await orderRes.json();
      } else {
        const res = await fetch(`${BASE_URL}/orders/guest`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: {
              email: address.email || undefined,
              fullName: address.fullName,
              phone: address.phone,
              addressLine1: address.addressLine1,
              addressLine2: address.addressLine2 || undefined,
              city: address.city || address.state || "Dhaka",
              state: address.state || "Dhaka",
              postalCode: address.postalCode || "",
              country: address.country || "Bangladesh",
            },
            items: lineItems,
            deliveryZone,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message ?? "Failed to place order");
        }

        data = await res.json();
      }

      const shippingCost = Number(data.shippingCost ?? 0);
      // The API's own `discount` covers coupons only.
      const couponDiscount = Number(data.discount ?? 0);
      const quoted = totals.subtotal - couponDiscount + shippingCost;

      const result: OrderResult = {
        orderNumber: (data.orderNumber ?? data.id ?? "N/A") as string,
        /**
         * The API totals an order from the raw variant price — it does not
         * apply the catalogue offers the shopper was quoted at checkout. So
         * when a line carried an offer the invoice bills the quoted amount;
         * with no offer in play the API's own total stays authoritative, and
         * takes back over automatically once the API applies offers itself.
         */
        total: totals.productDiscount > 0 ? quoted : Number(data.total ?? quoted),
        shippingCost,
        subtotal: totals.listSubtotal,
        productDiscount: totals.productDiscount,
        discount: couponDiscount,
        items: targetItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          originalPrice: i.originalPrice,
          image: i.image,
        })),
        address: { ...address },
        paymentMethod: extra?.paymentMethod,
        orderNote: extra?.orderNote,
        placedAt: typeof data.placedAt === "string" ? data.placedAt : undefined,
        deliveryZone,
      };

      if (targetItems.length >= items.length) {
        clearCart();
      } else {
        for (const i of targetItems) {
          removeItem(i.slug);
        }
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("selectedCartSlugs");
      }

      toast.success("Order placed successfully!");
      return result;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { placeOrder, submitting };
}
