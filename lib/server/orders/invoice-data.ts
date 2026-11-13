import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { prisma } from "@/lib/server/prisma";
import { notFound } from "@/lib/server/http-error";
import { toNumber } from "@/utils/decimal";
import { normalizeBdPhone } from "@/utils/phone";
import type { InvoiceDocument } from "@/types/commerce/invoice";

/**
 * The frozen order an invoice is printed from. Looked up by order number and
 * the phone it was placed with, so a guest can download their own invoice
 * without an account while a bare order number reveals nothing. Every figure
 * and the invoice number come from the order row, so the PDF is the same
 * document however many times it is downloaded.
 */
export async function loadInvoiceOrder(orderNumber: string, phone: string): Promise<Omit<InvoiceDocument, "shop">> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      invoiceNumber: true,
      placedAt: true,
      deliveryZone: true,
      subtotal: true,
      productDiscount: true,
      discount: true,
      shippingCost: true,
      total: true,
      customerNote: true,
      shippingAddress: {
        select: { fullName: true, phone: true, email: true, addressLine1: true, addressLine2: true, city: true, state: true, postalCode: true },
      },
      items: {
        orderBy: { id: "asc" },
        select: { productName: true, sku: true, colorName: true, sizeLabel: true, quantity: true, unitPrice: true, listPrice: true },
      },
    },
  });
  const address = order?.shippingAddress;
  if (!order || !address || normalizeBdPhone(address.phone) !== normalizeBdPhone(phone)) {
    throw notFound(ERROR_MESSAGES.order.notFound(orderNumber));
  }
  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber,
    placedAt: order.placedAt,
    deliveryZone: order.deliveryZone,
    note: order.customerNote,
    customer: address,
    items: order.items.map((item) => ({
      name: item.productName,
      caption: [item.sku && `SKU ${item.sku}`, item.colorName, item.sizeLabel && `Size ${item.sizeLabel}`].filter(Boolean).join(" · "),
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      listPrice: toNumber(item.listPrice),
    })),
    totals: {
      subtotal: toNumber(order.subtotal),
      productDiscount: toNumber(order.productDiscount),
      couponDiscount: toNumber(order.discount),
      shipping: toNumber(order.shippingCost),
      total: toNumber(order.total),
    },
  };
}
