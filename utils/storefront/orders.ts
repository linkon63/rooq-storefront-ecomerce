import type { Order, OrderLine, OrderStatus, PaymentStatus, ShippingAddressInput } from "@/types/storefront/commerce";
import { toAmount } from "./money";

type UnknownRecord = Record<string, unknown>;
const record = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const text = (value: unknown): string | null => (typeof value === "string" && value ? value : null);

function lineImage(item: UnknownRecord): string | null {
  const direct = item.image;
  if (typeof direct === "string") return direct;
  return text(record(direct).url) ?? text(item.imageUrl);
}

function orderLine(raw: unknown): OrderLine {
  const item = record(raw);
  const variant = record(item.variant);
  return {
    id: String(item.id ?? ""),
    productId: text(item.productId),
    productName: text(item.productName) ?? text(record(item.product).name) ?? "",
    productSlug: text(item.productSlug) ?? text(record(item.product).slug),
    sku: text(item.sku) ?? text(variant.sku) ?? "",
    colorName: text(item.colorName),
    colorHex: text(item.colorHex),
    sizeLabel: text(item.sizeLabel),
    quantity: Number(item.quantity ?? 0),
    unitPrice: toAmount(item.unitPrice),
    listPrice: toAmount(item.listPrice ?? item.unitPrice),
    totalPrice: toAmount(item.totalPrice),
    image: lineImage(item),
  };
}

function shippingAddress(raw: unknown): ShippingAddressInput | null {
  const address = record(raw);
  const fullName = text(address.fullName);
  if (!fullName) return null;
  return {
    email: text(address.email) ?? undefined,
    fullName,
    phone: text(address.phone) ?? "",
    addressLine1: text(address.addressLine1) ?? "",
    addressLine2: text(address.addressLine2) ?? undefined,
    city: text(address.city) ?? "",
    state: text(address.state) ?? undefined,
    postalCode: text(address.postalCode) ?? undefined,
    country: text(address.country) ?? undefined,
  };
}

/** Order JSON (Decimals as strings or numbers) → the storefront Order. */
export function orderFromApi(raw: unknown): Order {
  const order = record(raw);
  return {
    id: String(order.id ?? ""),
    orderNumber: text(order.orderNumber) ?? "",
    invoiceNumber: text(order.invoiceNumber),
    status: (text(order.status) ?? "pending") as OrderStatus,
    paymentStatus: (text(order.paymentStatus) ?? "unpaid") as PaymentStatus,
    subtotal: toAmount(order.subtotal),
    productDiscount: toAmount(order.productDiscount),
    discount: toAmount(order.discount),
    shippingCost: toAmount(order.shippingCost),
    total: toAmount(order.total),
    couponCode: text(order.couponCode),
    placedAt: text(order.placedAt) ?? text(order.createdAt) ?? "",
    items: Array.isArray(order.items) ? order.items.map(orderLine) : [],
    shippingAddress: shippingAddress(order.shippingAddress ?? order.address),
  };
}

/** Accepts a bare array or a `{ data }` envelope. */
export function ordersFromApi(raw: unknown): Order[] {
  const list = Array.isArray(raw) ? raw : Array.isArray(record(raw).data) ? (record(raw).data as unknown[]) : [];
  return list.map(orderFromApi);
}

export function canCancel(status: OrderStatus): boolean {
  return status === "pending" || status === "processing";
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Variant line under a product name: "Black, size M". */
export function variantCaption(colorName: string | null, sizeLabel: string | null): string {
  const parts = [colorName, sizeLabel ? `size ${sizeLabel}` : null].filter(Boolean);
  return parts.join(", ");
}
