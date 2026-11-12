import type { WholesaleRequestStatus } from "@/lib/generated/prisma/enums";
import type { ColorRef, SizeRef } from "@/utils/mappers/catalog-refs";
import type { SavedAddressResponse } from "./order";

export type { WholesaleRequestStatus };

export type WholesaleRequestItemResponse = {
  id: string;
  productId: string;
  variantId: string | null;
  requestedQuantity: number;
  targetPrice: number | null;
  note: string | null;
  product: { id: string; name: string; slug: string; price: number; image: string | null } | null;
  variant: { id: string; sku: string; price: number; stock: number; color: ColorRef; size: SizeRef } | null;
};

export type WholesaleRequestResponse = {
  id: string;
  requestNumber: string;
  status: WholesaleRequestStatus;
  customerNote: string | null;
  adminNote: string | null;
  infoRequestMessage: string | null;
  contactPhone: string | null;
  userId: string;
  /** `addresses` is only on the detail endpoints (for the convert form). */
  user: { id: string; name: string; email: string | null; phone: string | null; addresses?: SavedAddressResponse[] };
  items: WholesaleRequestItemResponse[];
  orderId: string | null;
  order: { id: string; orderNumber: string; status: string; total: number } | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConvertWholesaleInput = {
  addressId: string;
  items: { requestItemId?: string; productId?: string; variantId?: string; quantity: number; unitPrice: number }[];
  discount?: number;
  shippingCost?: number;
  tax?: number;
  paymentStatus?: "unpaid" | "paid" | "refunded";
};
