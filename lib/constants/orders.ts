/** Notes filed on order status logs and stock movements (shown back in the admin). */
export const ORDER_NOTES = {
  created: "Order created",
  guestPlaced: "Guest order placed",
  posSale: "Sold in store (POS)",
  cancelledByCustomer: "Cancelled by the customer",
  stockCancelled: (orderNumber: string) => `Order ${orderNumber} cancelled`,
  stockReturned: (orderNumber: string) => `Order ${orderNumber} returned`,
  shippedByCourier: (courier: string) => `Handed to ${courier}`,
  deliveredByCourier: (courier: string) => `Delivered by ${courier}`,
  wholesaleCreated: (requestNumber: string) => `Wholesale order created from request ${requestNumber}`,
  wholesaleStock: (orderNumber: string) => `Wholesale order ${orderNumber}`,
  returnedInFull: (requestNumber: string) => `Every item returned (${requestNumber})`,
  restockReturn: (requestNumber: string) => `Return ${requestNumber}`,
  exchangeOut: (requestNumber: string) => `Exchange for return ${requestNumber}`,
} as const;

/** Default delivery zone when checkout does not send one. */
export const DEFAULT_DELIVERY_ZONE = "inside" as const;

/** Walk-in buyer shown on POS sales without a name. */
export const POS_WALK_IN_NAME = "Walk-in customer";
export const POS_ADDRESS_LINE = "In-store purchase";

/** Payment method aliases the old API accepted ("cod"). */
export const PAYMENT_METHOD_ALIASES: Record<string, string> = {
  cod: "cash_on_delivery",
  "cash-on-delivery": "cash_on_delivery",
  bank: "bank_transfer",
};

/** Customer-facing notification copy for order status changes. */
export const ORDER_STATUS_COPY: Record<string, string> = {
  pending: "is waiting to be confirmed",
  processing: "is being prepared",
  shipped: "is on its way",
  delivered: "has been delivered",
  cancelled: "was cancelled",
  returned: "was returned",
};
