import type { ReturnReason, ReturnResolution, ReturnStatus } from "@/lib/generated/prisma/enums";
import type { ColorRef, SizeRef } from "@/utils/mappers/catalog-refs";

export type { ReturnReason, ReturnResolution, ReturnStatus };

export type ReturnItemResponse = {
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
    unitPrice: number;
    quantity: number;
    image: string | null;
  };
  exchangeVariant: { id: string; sku: string; color: ColorRef; size: SizeRef } | null;
};

export type ReturnRequestResponse = {
  id: string;
  /** "RET-2026-4F7K2Q" */
  requestNumber: string;
  status: ReturnStatus;
  resolution: ReturnResolution;
  customerNote: string | null;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: string;
  approvedAt: string | null;
  resolvedAt: string | null;
  order: { id: string; orderNumber: string; placedAt: string };
  user: { id: string; name: string; email: string | null } | null;
  items: ReturnItemResponse[];
};

/** GET /orders/:id/returnable */
export type ReturnableOrderResponse = {
  eligible: boolean;
  reason?: string;
  deadline: string | null;
  items: {
    orderItemId: string;
    productId: string | null;
    productName: string;
    sku: string;
    colorName: string | null;
    sizeLabel: string | null;
    quantity: number;
    returnableQuantity: number;
    image: string | null;
  }[];
};

export type ReturnStatusInput = {
  status: ReturnStatus;
  adminNote?: string;
  refundAmount?: number;
  restock?: boolean;
};
