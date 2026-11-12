import type { OrderResult, OrderResultItem } from "@/types/storefront/ui";
import type { OrderResponse } from "@/types/commerce/order";
import { lineOptions, orderCustomer, orderPaymentMethod, orderTotals } from "@/utils/orders/display";

/**
 * An admin order in the shape the customer's invoice is printed from, so the
 * copy printed from Orders is the same document the shopper got at checkout.
 * Every figure is the one frozen on the order (line snapshots, totals, zone).
 */
export function orderToInvoice(order: OrderResponse): OrderResult {
  const customer = orderCustomer(order);
  const payment = orderPaymentMethod(order);
  const totals = orderTotals(order);
  const address = order.shippingAddress ?? order.address;

  const items: OrderResultItem[] = order.items.map((item) => {
    const options = lineOptions(item);
    return {
      name: item.productName,
      sku: item.sku,
      options: options ? [options] : [],
      quantity: item.quantity,
      price: item.unitPrice,
      originalPrice: item.listPrice > item.unitPrice ? item.listPrice : undefined,
      image: item.imageUrl ?? "",
    };
  });

  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber ?? undefined,
    total: totals.grand,
    shippingCost: totals.shipping,
    subtotal: totals.subtotal,
    productDiscount: totals.productDiscount,
    discount: totals.discount,
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
    orderNote: order.customerNote ?? undefined,
    placedAt: order.placedAt,
    deliveryZone: order.deliveryZone ?? undefined,
  };
}
