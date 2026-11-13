import type { AbandonedCartItem, AbandonedCartStatus, AdminAbandonedCart } from "@/types/commerce/abandoned-cart";
import { toNumber } from "@/utils/decimal";

type Row = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  items: unknown;
  itemCount: number;
  subtotal: Parameters<typeof toNumber>[0];
  status: AbandonedCartStatus;
  orderNumber: string | null;
  recoveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/** abandoned_carts row → the admin list shape (items were validated when saved). */
export function toAdminAbandonedCart(row: Row): AdminAbandonedCart {
  return {
    id: row.id,
    fullName: row.fullName,
    phone: row.phone,
    email: row.email,
    city: row.city,
    items: Array.isArray(row.items) ? (row.items as AbandonedCartItem[]) : [],
    itemCount: row.itemCount,
    subtotal: toNumber(row.subtotal),
    status: row.status,
    orderNumber: row.orderNumber,
    recoveredAt: row.recoveredAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
