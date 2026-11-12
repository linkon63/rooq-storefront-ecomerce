import type { OrderStatus, WholesaleRequestStatus } from "@/lib/generated/prisma/enums";
import { toNumber, toNumberOrNull, type DecimalLike } from "@/utils/decimal";
import { toColorRef, toSizeRef, type ColorRef, type SizeRef } from "./catalog-refs";
import { cardImages, type GalleryRow } from "./product-gallery";
import { toSavedAddress, type SavedAddressRow } from "./order";
import type { WholesaleRequestItemResponse, WholesaleRequestResponse } from "@/types/commerce/wholesale";

export type WholesaleItemRow = {
  id: string;
  productId: string;
  variantId: string | null;
  requestedQuantity: number;
  targetPrice: DecimalLike | null;
  note: string | null;
  product: { id: string; name: string; slug: string; price: DecimalLike; media: GalleryRow[] } | null;
  variant: { id: string; sku: string; price: DecimalLike | null; stock: number; colorId: string; color: ColorRef; size: SizeRef } | null;
};

export type WholesaleRequestRow = {
  id: string;
  requestNumber: string;
  status: WholesaleRequestStatus;
  customerNote: string | null;
  adminNote: string | null;
  infoRequestMessage: string | null;
  contactPhone: string | null;
  userId: string;
  user: { id: string; name: string; email: string | null; phone: string | null; addresses?: SavedAddressRow[] };
  items: WholesaleItemRow[];
  orderId: string | null;
  order: { id: string; orderNumber: string; status: OrderStatus; total: DecimalLike } | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function toItem(row: WholesaleItemRow): WholesaleRequestItemResponse {
  const productPrice = row.product ? toNumber(row.product.price) : 0;
  return {
    id: row.id,
    productId: row.productId,
    variantId: row.variantId,
    requestedQuantity: row.requestedQuantity,
    targetPrice: toNumberOrNull(row.targetPrice),
    note: row.note,
    product: row.product
      ? {
          id: row.product.id,
          name: row.product.name,
          slug: row.product.slug,
          price: productPrice,
          image: cardImages(row.product.media, row.variant?.colorId ?? null).image?.url ?? null,
        }
      : null,
    variant: row.variant
      ? {
          id: row.variant.id,
          sku: row.variant.sku,
          price: toNumberOrNull(row.variant.price) ?? productPrice,
          stock: row.variant.stock,
          color: toColorRef(row.variant.color),
          size: toSizeRef(row.variant.size),
        }
      : null,
  };
}

export function toWholesaleResponse(row: WholesaleRequestRow): WholesaleRequestResponse {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    status: row.status,
    customerNote: row.customerNote,
    adminNote: row.adminNote,
    infoRequestMessage: row.infoRequestMessage,
    contactPhone: row.contactPhone,
    userId: row.userId,
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      phone: row.user.phone,
      ...(row.user.addresses ? { addresses: row.user.addresses.map(toSavedAddress) } : {}),
    },
    items: row.items.map(toItem),
    orderId: row.orderId,
    order: row.order
      ? { id: row.order.id, orderNumber: row.order.orderNumber, status: row.order.status, total: toNumber(row.order.total) }
      : null,
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
