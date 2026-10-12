import type { DeliveryZone, OrderResult, OrderResultItem } from "@/lib/types";
import type { ShopSettings } from "@/lib/shop-api";
import {
  orderCustomer,
  orderPaymentMethod,
  type Order,
  type OrderItem,
  type OrderTotals,
} from "@/lib/admin-api";

function num(value: unknown): number {
  return Number(value ?? 0);
}

/** "Weight: 500 g · Colour: Red" for a variant, or "" when it has no options. */
function variantSuffix(item: OrderItem): string {
  const parts = (item.variant?.optionValues ?? [])
    .map(({ attribute, value }) => `${attribute?.name ?? "Variant"}: ${value}`)
    .filter(Boolean);
  return parts.length > 0 ? ` (${parts.join(" · ")})` : "";
}

/**
 * Which rate the delivery charge came from.
 *
 * The API prices the order from the zone it is sent but does not keep the zone
 * on the order, so it is read back off the charge: an amount that matches
 * exactly one of the shop's three rates names that zone, and anything
 * ambiguous — two zones priced the same, or a rate changed since — names none,
 * which simply leaves the row off the invoice rather than guessing wrong.
 */
function resolveZoneFromCharge(
  shipping: number,
  settings: ShopSettings | null,
): DeliveryZone | undefined {
  if (!settings) return undefined;
  const rates: [DeliveryZone, number][] = [
    ["inside", num(settings.deliveryChargeInside)],
    ["near_city", num(settings.deliveryChargeNearCity)],
    ["outside", num(settings.deliveryChargeOutside)],
  ];
  const matches = rates.filter(([, rate]) => rate === shipping);
  return matches.length === 1 ? matches[0][0] : undefined;
}

/**
 * An admin order in the shape the customer's invoice is printed from, so the
 * copy the shop prints from Orders is the same document the shopper got on the
 * confirmation page — same arithmetic, same wording, same sheet.
 *
 * `totals` is preferred wherever it is loaded, because that is what the Orders
 * screen already shows; the order's own columns are the fallback.
 */
export function orderToInvoice(
  order: Order,
  totals: OrderTotals | null,
  settings: ShopSettings | null,
): OrderResult {
  const customer = orderCustomer(order);
  const payment = orderPaymentMethod(order);
  const address = order.address ?? order.shippingAddress ?? null;

  const items: OrderResultItem[] = (order.items ?? []).map((item) => {
    const unitPrice = num(item.unitPrice);
    const listPrice = num(item.listPrice ?? item.unitPrice);
    return {
      name: `${item.product?.name ?? "Product"}${variantSuffix(item)}`,
      quantity: item.quantity,
      price: unitPrice,
      // Only a discounted line carries a list price, which is what makes the
      // invoice strike the old price through.
      originalPrice: listPrice > unitPrice ? listPrice : undefined,
      image: "",
    };
  });

  const shippingCost = totals?.shipping ?? num(order.shippingCost);

  return {
    orderNumber: order.orderNumber,
    total: totals?.grand ?? num(order.total),
    shippingCost,
    subtotal: totals?.subtotal,
    productDiscount: totals?.productDiscount ?? num(order.productDiscount),
    discount: totals?.discount ?? num(order.discount),
    items,
    address: {
      email: customer.email ?? "",
      fullName: customer.name,
      phone: customer.phone ?? "",
      addressLine1: address?.addressLine1 ?? "",
      addressLine2: address?.addressLine2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postalCode ?? "",
      country: address?.country ?? "Bangladesh",
    },
    paymentMethod: payment.isCod ? "cod" : payment.label,
    placedAt: order.placedAt,
    deliveryZone: resolveZoneFromCharge(shippingCost, settings),
  };
}
