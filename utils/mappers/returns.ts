import type { ReturnReason, ReturnResolution, ReturnStatus } from "@/lib/generated/prisma/enums";
import { toNumber, toNumberOrNull, type DecimalLike } from "@/utils/decimal";
import { mediaSrc, type MediaRef } from "@/utils/media-url";
import { toColorRef, toSizeRef, type ColorRef, type SizeRef } from "./catalog-refs";
import type { ReturnItemResponse, ReturnRequestResponse } from "@/types/commerce/returns";

export type ReturnItemRow = {
  id: string;
  quantity: number;
  reason: ReturnReason;
  note: string | null;
  restocked: boolean;
  orderItem: {
    id: string;
    productName: string;
    sku: string;
    colorName: string | null;
    sizeLabel: string | null;
    unitPrice: DecimalLike;
    quantity: number;
    imageMedia: MediaRef | null;
  };
  exchangeVariant: { id: string; sku: string; color: ColorRef; size: SizeRef } | null;
};

export type ReturnRequestRow = {
  id: string;
  requestNumber: string;
  status: ReturnStatus;
  resolution: ReturnResolution;
  customerNote: string | null;
  adminNote: string | null;
  refundAmount: DecimalLike | null;
  createdAt: Date;
  approvedAt: Date | null;
  resolvedAt: Date | null;
  order: { id: string; orderNumber: string; placedAt: Date };
  user: { id: string; name: string; email: string | null } | null;
  items: ReturnItemRow[];
};

const iso = (value: Date | null) => (value ? value.toISOString() : null);

export function toReturnItemResponse(row: ReturnItemRow): ReturnItemResponse {
  return {
    id: row.id,
    quantity: row.quantity,
    reason: row.reason,
    note: row.note,
    restocked: row.restocked,
    orderItem: {
      id: row.orderItem.id,
      productName: row.orderItem.productName,
      sku: row.orderItem.sku,
      colorName: row.orderItem.colorName,
      sizeLabel: row.orderItem.sizeLabel,
      unitPrice: toNumber(row.orderItem.unitPrice),
      quantity: row.orderItem.quantity,
      image: mediaSrc(row.orderItem.imageMedia),
    },
    exchangeVariant: row.exchangeVariant
      ? {
          id: row.exchangeVariant.id,
          sku: row.exchangeVariant.sku,
          color: toColorRef(row.exchangeVariant.color),
          size: toSizeRef(row.exchangeVariant.size),
        }
      : null,
  };
}

export function toReturnResponse(row: ReturnRequestRow): ReturnRequestResponse {
  return {
    id: row.id,
    requestNumber: row.requestNumber,
    status: row.status,
    resolution: row.resolution,
    customerNote: row.customerNote,
    adminNote: row.adminNote,
    refundAmount: toNumberOrNull(row.refundAmount),
    createdAt: row.createdAt.toISOString(),
    approvedAt: iso(row.approvedAt),
    resolvedAt: iso(row.resolvedAt),
    order: { id: row.order.id, orderNumber: row.order.orderNumber, placedAt: row.order.placedAt.toISOString() },
    user: row.user ? { id: row.user.id, name: row.user.name, email: row.user.email } : null,
    items: row.items.map(toReturnItemResponse),
  };
}
