import type {
  DeliveryZone,
  OrderStatus,
  OrderType,
  PaymentStatus,
} from "@/lib/generated/prisma/enums";
import { toNumber, type DecimalLike } from "@/utils/decimal";
import { mediaSrc, type MediaRef } from "@/utils/media-url";
import { toColorRef, toSizeRef, type ColorRef, type SizeRef } from "./catalog-refs";
import { toPaymentResponse, toShipmentResponse, type PaymentRow, type ShipmentRow } from "./payment";
import type {
  OrderAddressResponse,
  OrderItemResponse,
  OrderResponse,
  OrderStatusLogResponse,
  SavedAddressResponse,
} from "@/types/commerce/order";

// ---- row shapes (what `orderInclude` in lib/server/orders/select.ts loads) ----

export type OrderAddressRow = {
  email?: string | null;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
};

export type SavedAddressRow = OrderAddressRow & { id: string; label: string | null; isDefault: boolean };

export type OrderItemRow = {
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
  unitPrice: DecimalLike;
  listPrice: DecimalLike;
  discountAmount: DecimalLike;
  totalPrice: DecimalLike;
  imageMedia: MediaRef | null;
  product: { id: string; name: string; slug: string } | null;
  variant: { id: string; sku: string; isActive: boolean; color: ColorRef; size: SizeRef } | null;
};

export type OrderStatusLogRow = {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
  changedBy: { id: string; name: string } | null;
};

export type OrderRow = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  deliveryZone: DeliveryZone | null;
  currency: string;
  subtotal: DecimalLike;
  productDiscount: DecimalLike;
  discount: DecimalLike;
  shippingCost: DecimalLike;
  tax: DecimalLike;
  total: DecimalLike;
  couponCode: string | null;
  customerNote: string | null;
  adminNote: string | null;
  userId: string | null;
  user: { id: string; name: string; email: string | null; phone: string | null } | null;
  addressId: string | null;
  address: SavedAddressRow | null;
  shippingAddress: OrderAddressRow | null;
  items: OrderItemRow[];
  payments: PaymentRow[];
  shipments: ShipmentRow[];
  statusLogs: OrderStatusLogRow[];
  placedAt: Date;
  updatedAt: Date;
};

// ---- mappers ---------------------------------------------------------------

export function toOrderAddress(row: OrderAddressRow): OrderAddressResponse {
  return {
    email: row.email ?? null,
    fullName: row.fullName,
    phone: row.phone,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
  };
}

export function toSavedAddress(row: SavedAddressRow): SavedAddressResponse {
  return { ...toOrderAddress(row), id: row.id, label: row.label, isDefault: row.isDefault };
}

export function toOrderItemResponse(row: OrderItemRow): OrderItemResponse {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    variantId: row.variantId,
    productName: row.productName,
    productSlug: row.productSlug,
    sku: row.sku,
    colorName: row.colorName,
    colorHex: row.colorHex,
    sizeLabel: row.sizeLabel,
    quantity: row.quantity,
    unitPrice: toNumber(row.unitPrice),
    listPrice: toNumber(row.listPrice),
    discountAmount: toNumber(row.discountAmount),
    totalPrice: toNumber(row.totalPrice),
    imageUrl: mediaSrc(row.imageMedia),
    product: row.product ? { id: row.product.id, name: row.product.name, slug: row.product.slug } : null,
    variant: row.variant
      ? {
          id: row.variant.id,
          sku: row.variant.sku,
          isActive: row.variant.isActive,
          color: toColorRef(row.variant.color),
          size: toSizeRef(row.variant.size),
        }
      : null,
  };
}

function toStatusLog(row: OrderStatusLogRow): OrderStatusLogResponse {
  return {
    id: row.id,
    status: row.status,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    changedBy: row.changedBy ? { id: row.changedBy.id, name: row.changedBy.name } : null,
  };
}

export function toOrderResponse(row: OrderRow): OrderResponse {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    invoiceNumber: row.invoiceNumber,
    status: row.status,
    paymentStatus: row.paymentStatus,
    orderType: row.orderType,
    deliveryZone: row.deliveryZone,
    currency: row.currency,
    subtotal: toNumber(row.subtotal),
    productDiscount: toNumber(row.productDiscount),
    discount: toNumber(row.discount),
    shippingCost: toNumber(row.shippingCost),
    tax: toNumber(row.tax),
    total: toNumber(row.total),
    couponCode: row.couponCode,
    customerNote: row.customerNote,
    adminNote: row.adminNote,
    userId: row.userId,
    user: row.user ? { id: row.user.id, name: row.user.name, email: row.user.email, phone: row.user.phone } : null,
    addressId: row.addressId,
    address: row.address ? toSavedAddress(row.address) : null,
    shippingAddress: row.shippingAddress ? toOrderAddress(row.shippingAddress) : null,
    items: row.items.map(toOrderItemResponse),
    payments: row.payments.map(toPaymentResponse),
    shipments: row.shipments.map(toShipmentResponse),
    statusLogs: row.statusLogs.map(toStatusLog),
    placedAt: row.placedAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
