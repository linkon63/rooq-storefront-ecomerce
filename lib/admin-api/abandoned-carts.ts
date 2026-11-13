import { apiRequest } from "@/lib/admin/http";
import type { AdminAbandonedCart } from "@/types/commerce/abandoned-cart";
import type { Paginated } from "@/types/catalog-admin";

/** Admin client for checkouts left before the order was placed. */
export const abandonedCartsApi = {
  list: (params: URLSearchParams) => apiRequest<Paginated<AdminAbandonedCart>>(`/abandoned-carts?${params.toString()}`),
  remove: (id: string) => apiRequest<unknown>(`/abandoned-carts/${id}`, { method: "DELETE" }),
};
