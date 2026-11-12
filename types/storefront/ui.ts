export type CartItem = {
  slug: string;
  name: string;
  /** What the shopper pays per unit — the discounted price when one applies. */
  price: number;
  /**
   * The list price `price` was discounted from. Absent when the line carries no
   * offer, so `originalPrice > price` is the test for "this line is discounted".
   */
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  id?: string;
  productId?: string;
  variantId?: string;
  attributes?: Record<string, string>;
};

/** Delivery zones the checkout can pick; rates come from the settings API. */
/** The shipping address printed on an invoice. */
export type AddressForm = {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type DeliveryZone = "inside" | "near_city" | "outside";

export type OrderResultItem = {
  name: string;
  quantity: number;
  /** Unit price charged — discounted where an offer applied. */
  price: number;
  /** Unit list price, present only when this line was discounted. */
  originalPrice?: number;
  image: string;
  /** Variant SKU, printed under the product name on the invoice. */
  sku?: string;
  /** The variant's options — ["Weight: 250 g"] — printed beside the SKU. */
  options?: string[];
};

export type OrderResult = {
  /** The order ID, "ORD-1791814438172". */
  orderNumber: string;
  /**
   * "INV-2026-000123", issued by the API once per order and never changed.
   * Absent on orders the API returned before invoice numbers existed.
   */
  invoiceNumber?: string;
  total: number;
  /** Delivery charge the API applied, from Admin → Settings → General. */
  shippingCost?: number;
  /** Discount the API applied (coupon or product rule), in shop currency. */
  discount?: number;
  /** Sum of the line list prices, before any discount or delivery charge. */
  subtotal?: number;
  /** What the product offers took off the list subtotal. */
  productDiscount?: number;
  items: OrderResultItem[];
  address: AddressForm;
  paymentMethod?: string;
  orderNote?: string;
  /** When the API recorded the order — printed on the invoice. */
  placedAt?: string;
  /** Which rate the delivery charge came from. */
  deliveryZone?: DeliveryZone;
};
