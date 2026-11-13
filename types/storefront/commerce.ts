import type { ColorRef, FitFeedback, Image, SizeRef } from "./catalog";

/** One bag line, the same shape for guests (localStorage) and signed-in shoppers (API). */
export type CartLine = {
  /** Server cart-item id when synced; the variant id for a guest line. */
  id: string;
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  sku: string;
  colorName: string | null;
  colorHex: string | null;
  sizeLabel: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  inStock: boolean;
  lowStockCount: number | null;
};

/** What a product page hands to "Add to bag". */
export type CartLineInput = Omit<CartLine, "id" | "quantity"> & { quantity?: number };

/** GET /cart line, per the contract. */
export type ServerCartItem = {
  id: string;
  variantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    inStock: boolean;
    /** False when the variant or its product is no longer sold. */
    isAvailable?: boolean;
    lowStockCount: number | null;
    color: ColorRef | null;
    size: SizeRef | null;
    product: { id: string; slug: string; name: string; image: Image | string | null };
  };
};

export type ServerCart = { id?: string; items: ServerCartItem[] };

export type DeliveryZoneKey = "inside" | "near_city" | "outside";

export type ShippingAddressInput = {
  email?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type SavedAddress = ShippingAddressInput & {
  id: string;
  label?: string | null;
  isDefault: boolean;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "unpaid" | "paid" | "partially_refunded" | "refunded";

export type OrderLine = {
  id: string;
  productId: string | null;
  productName: string;
  productSlug: string | null;
  sku: string;
  colorName: string | null;
  colorHex: string | null;
  sizeLabel: string | null;
  quantity: number;
  unitPrice: number;
  listPrice: number;
  totalPrice: number;
  image: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  productDiscount: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode: string | null;
  customerNote: string | null;
  deliveryZone: DeliveryZoneKey | null;
  placedAt: string;
  items: OrderLine[];
  shippingAddress: ShippingAddressInput | null;
};

export type CouponQuote = { discount: number; total: number; code: string };

export type ReturnStatus = "REQUESTED" | "APPROVED" | "REJECTED" | "REFUNDED" | "EXCHANGED" | "CANCELLED";
export type ReturnReason =
  | "TOO_SMALL"
  | "TOO_LARGE"
  | "NOT_AS_DESCRIBED"
  | "DAMAGED"
  | "WRONG_ITEM"
  | "QUALITY"
  | "CHANGED_MIND"
  | "OTHER";
export type ReturnResolution = "REFUND" | "EXCHANGE";

export type ReturnableItem = {
  orderItemId: string;
  productName: string;
  sku: string;
  colorName: string | null;
  sizeLabel: string | null;
  quantity: number;
  returnableQuantity: number;
  image: string | null;
};

export type Returnable = {
  eligible: boolean;
  reason?: string;
  deadline: string | null;
  items: ReturnableItem[];
};

export type ReturnRequestInput = {
  orderId: string;
  resolution: ReturnResolution;
  customerNote?: string;
  items: { orderItemId: string; quantity: number; reason: ReturnReason; note?: string; exchangeVariantId?: string }[];
};

export type ReturnRequest = {
  id: string;
  requestNumber: string;
  status: ReturnStatus;
  resolution: ReturnResolution;
  customerNote: string | null;
  adminNote: string | null;
  refundAmount: number | null;
  createdAt: string;
  order: { id: string; orderNumber: string; placedAt: string };
  items: {
    id: string;
    quantity: number;
    reason: ReturnReason;
    note: string | null;
    orderItem: { id: string; productName: string; sku: string; colorName: string | null; sizeLabel: string | null; image: string | null };
    exchangeVariant: { id: string; sku: string; color: ColorRef; size: SizeRef } | null;
  }[];
};

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  fitFeedback: FitFeedback | null;
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { id: string; name: string; avatar: string | null };
  variant: { color: string; size: string } | null;
  photos: Image[];
};

/** A review shown outside its product page (home showcase): carries the product it is about. */
export type ReviewWithProduct = Review & { product: { id: string; name: string; slug: string } };

export type ReviewSummary = {
  average: number;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  fit: { RUNS_SMALL: number; TRUE_TO_SIZE: number; RUNS_LARGE: number; total: number; verdict: FitFeedback | null };
};

export type ReviewSort = "newest" | "rating_desc" | "rating_asc";
