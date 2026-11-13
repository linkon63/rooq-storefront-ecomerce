export type AbandonedCartStatus = "OPEN" | "RECOVERED";

/** One line of the cart as the shopper saw it at checkout. */
export type AbandonedCartItem = {
  variantId: string;
  name: string;
  sku: string;
  image: string | null;
  color: string | null;
  size: string | null;
  price: number;
  quantity: number;
};

/** What checkout sends while the shopper is filling in the form. */
export type AbandonedCartInput = {
  token: string;
  fullName: string;
  phone: string;
  email?: string;
  city?: string;
  items: AbandonedCartItem[];
};

/** Admin list row. */
export type AdminAbandonedCart = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  items: AbandonedCartItem[];
  itemCount: number;
  subtotal: number;
  status: AbandonedCartStatus;
  orderNumber: string | null;
  recoveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};
