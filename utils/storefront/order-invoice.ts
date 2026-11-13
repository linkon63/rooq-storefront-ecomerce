import type { Order } from "@/types/storefront/commerce";
import type { OrderResult } from "@/types/storefront/ui";

/**
 * The order just placed in the shape the invoice sheet is drawn from, so the
 * on-screen preview shows the same figures and numbers as the PDF.
 */
export function storefrontOrderToInvoice(order: Order): OrderResult {
  const address = order.shippingAddress;
  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber ?? undefined,
    total: order.total,
    shippingCost: order.shippingCost,
    subtotal: order.subtotal,
    productDiscount: order.productDiscount,
    discount: order.discount,
    items: order.items.map((item) => ({
      name: item.productName,
      sku: item.sku,
      options: [item.colorName, item.sizeLabel && `Size ${item.sizeLabel}`].filter((value): value is string => Boolean(value)),
      quantity: item.quantity,
      price: item.unitPrice,
      originalPrice: item.listPrice > item.unitPrice ? item.listPrice : undefined,
      image: item.image ?? "",
    })),
    address: {
      email: address?.email ?? "",
      fullName: address?.fullName ?? "",
      phone: address?.phone ?? "",
      addressLine1: address?.addressLine1 ?? "",
      addressLine2: address?.addressLine2 ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      postalCode: address?.postalCode ?? "",
      country: address?.country ?? "Bangladesh",
    },
    paymentMethod: "cod",
    orderNote: order.customerNote ?? undefined,
    placedAt: order.placedAt,
    deliveryZone: order.deliveryZone ?? undefined,
  };
}
