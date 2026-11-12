import type {
  DeliveryZone,
  OrderStatus,
  OrderType,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionStatus,
  ShipmentStatus,
} from "@/lib/generated/prisma/enums";
import type { ColorRef, SizeRef } from "@/utils/mappers/catalog-refs";

/**
 * JSON contract of every `/orders…` response (and the order embedded in
 * payments, shipments, returns and wholesale conversions). Money is a number,
 * dates are ISO strings, images are URL strings.
 */

export type { DeliveryZone, OrderStatus, OrderType, PaymentMethod, PaymentStatus, PaymentTransactionStatus, ShipmentStatus };

/** Frozen shipping address/contact (OrderAddress) or the saved address it came from. */
export type OrderAddressResponse = {
  email: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
};

export type SavedAddressResponse = OrderAddressResponse & { id: string; label: string | null; isDefault: boolean };

export type OrderCustomerRef = { id: string; name: string; email: string | null; phone: string | null };

/** One order line — a snapshot that survives later product edits. */
export type OrderItemResponse = {
  id: string;
  orderId: string;
  productId: string | null;
  variantId: string | null;
  productName: string;
  productSlug: string | null;
  sku: string;
  colorName: string | null;
  colorHex: string | null;
  sizeLabel: string | null;
  quantity: number;
  /** Charged per unit (offer price when one applied). */
  unitPrice: number;
  /** Catalogue price per unit before any offer. */
  listPrice: number;
  /** (listPrice − unitPrice) × quantity. */
  discountAmount: number;
  /** unitPrice × quantity. */
  totalPrice: number;
  /** The colour's primary image at the time of purchase. */
  imageUrl: string | null;
  product: { id: string; name: string; slug: string } | null;
  variant: { id: string; sku: string; isActive: boolean; color: ColorRef; size: SizeRef } | null;
};

export type PaymentResponse = {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  transactionId: string | null;
  status: PaymentTransactionStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ShipmentResponse = {
  id: string;
  orderId: string;
  courierName: string;
  trackingNumber: string | null;
  status: ShipmentStatus;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusLogResponse = {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
  changedBy: { id: string; name: string } | null;
};

export type OrderResponse = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  deliveryZone: DeliveryZone | null;
  currency: string;
  /** Σ listPrice × qty. */
  subtotal: number;
  /** What product offers took off. */
  productDiscount: number;
  /** Coupon discount only. */
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode: string | null;
  customerNote: string | null;
  adminNote: string | null;
  userId: string | null;
  user: OrderCustomerRef | null;
  addressId: string | null;
  /** The saved address it was shipped to, when the customer picked one. */
  address: SavedAddressResponse | null;
  /** Frozen copy written at placement (always present except POS sales). */
  shippingAddress: OrderAddressResponse | null;
  items: OrderItemResponse[];
  payments: PaymentResponse[];
  shipments: ShipmentResponse[];
  /** Newest first. */
  statusLogs: OrderStatusLogResponse[];
  placedAt: string;
  updatedAt: string;
};

export type PaginatedOrdersResponse = {
  data: OrderResponse[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
