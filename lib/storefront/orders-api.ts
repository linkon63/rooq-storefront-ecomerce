import { apiRequest } from "@/lib/api";
import type {
  DeliveryZoneKey,
  Order,
  ReturnRequest,
  ReturnRequestInput,
  Returnable,
  ShippingAddressInput,
} from "@/types/storefront/commerce";
import type { Paginated } from "@/types/storefront/catalog";
import { orderFromApi, ordersFromApi } from "@/utils/storefront/orders";

/** Orders (signed-in and guest) and returns & exchanges. */

type OrderLineInput = { variantId: string; quantity: number };

export async function placeOrder(input: {
  addressId: string;
  items: OrderLineInput[];
  deliveryZone: DeliveryZoneKey;
  couponCode?: string;
  customerNote?: string;
}): Promise<Order> {
  return orderFromApi(await apiRequest<unknown>("/orders", { method: "POST", body: input }));
}

export async function placeGuestOrder(input: {
  address: ShippingAddressInput;
  items: OrderLineInput[];
  deliveryZone: DeliveryZoneKey;
  couponCode?: string;
  customerNote?: string;
}): Promise<Order> {
  return orderFromApi(await apiRequest<unknown>("/orders/guest", { method: "POST", body: input }));
}

export async function listMyOrders(): Promise<Order[]> {
  return ordersFromApi(await apiRequest<unknown>("/orders/my-orders"));
}

export async function getOrder(id: string): Promise<Order> {
  return orderFromApi(await apiRequest<unknown>(`/orders/${encodeURIComponent(id)}`));
}

export async function cancelOrder(id: string): Promise<Order> {
  return orderFromApi(await apiRequest<unknown>(`/orders/${encodeURIComponent(id)}/cancel`, { method: "DELETE" }));
}

export function getReturnable(orderId: string): Promise<Returnable> {
  return apiRequest<Returnable>(`/orders/${encodeURIComponent(orderId)}/returnable`);
}

export function createReturn(input: ReturnRequestInput): Promise<ReturnRequest> {
  return apiRequest<ReturnRequest>("/returns", { method: "POST", body: input });
}

export function listMyReturns(page = 1): Promise<Paginated<ReturnRequest>> {
  return apiRequest<Paginated<ReturnRequest>>("/returns/my", { query: { page, limit: 20 } });
}

export function cancelReturn(id: string): Promise<ReturnRequest> {
  return apiRequest<ReturnRequest>(`/returns/${encodeURIComponent(id)}/cancel`, { method: "POST" });
}
