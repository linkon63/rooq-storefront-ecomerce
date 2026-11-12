import type { PaymentMethod, PaymentTransactionStatus, ShipmentStatus } from "@/lib/generated/prisma/enums";
import { toNumber, type DecimalLike } from "@/utils/decimal";
import type { PaymentResponse, ShipmentResponse } from "@/types/commerce/order";

export type PaymentRow = {
  id: string;
  orderId: string;
  amount: DecimalLike;
  method: PaymentMethod;
  transactionId: string | null;
  status: PaymentTransactionStatus;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ShipmentRow = {
  id: string;
  orderId: string;
  courierName: string;
  trackingNumber: string | null;
  status: ShipmentStatus;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const iso = (value: Date | null) => (value ? value.toISOString() : null);

export function toPaymentResponse(row: PaymentRow): PaymentResponse {
  return {
    id: row.id,
    orderId: row.orderId,
    amount: toNumber(row.amount),
    method: row.method,
    transactionId: row.transactionId,
    status: row.status,
    paidAt: iso(row.paidAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toShipmentResponse(row: ShipmentRow): ShipmentResponse {
  return {
    id: row.id,
    orderId: row.orderId,
    courierName: row.courierName,
    trackingNumber: row.trackingNumber,
    status: row.status,
    shippedAt: iso(row.shippedAt),
    deliveredAt: iso(row.deliveredAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
