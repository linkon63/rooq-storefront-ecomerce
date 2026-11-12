import { apiRequest, jsonInit } from "@/lib/admin/http";
import type { PosSaleInput } from "@/types/admin/commerce";
import type { CouponInput, CouponResponse } from "@/types/commerce/coupon";
import type { OrderResponse, OrderStatus, PaginatedOrdersResponse, PaymentResponse, PaymentStatus as OrderPaymentStatus, ShipmentResponse } from "@/types/commerce/order";
import type { ReturnRequestResponse, ReturnStatusInput } from "@/types/commerce/returns";
import type { ConvertWholesaleInput, WholesaleRequestResponse, WholesaleRequestStatus } from "@/types/commerce/wholesale";

export function listAdminOrders(params: URLSearchParams) {
  return apiRequest<PaginatedOrdersResponse>(`/orders?${params.toString()}`);
}

export function getAdminOrder(id: string) {
  return apiRequest<OrderResponse>(`/orders/${id}`);
}

export function updateAdminOrderStatus(
  id: string,
  body: { status?: OrderStatus; note?: string; paymentStatus?: OrderPaymentStatus },
) {
  return apiRequest<OrderResponse>(`/orders/${id}/status`, jsonInit("PATCH", body));
}

export function createPosSale(body: PosSaleInput) {
  return apiRequest<OrderResponse>("/orders/pos", jsonInit("POST", body));
}

export function createShipment(body: { orderId: string; courierName: string; trackingNumber?: string }) {
  return apiRequest<ShipmentResponse>("/shipments", jsonInit("POST", body));
}

export function markShipment(id: string, step: "shipped" | "delivered") {
  return apiRequest<ShipmentResponse>(`/shipments/${id}/${step}`, { method: "PATCH" });
}

export function recordManualPayment(body: { orderId: string; amount: number; method: string; transactionId?: string }) {
  return apiRequest<PaymentResponse>("/payments/manual", jsonInit("POST", body));
}

export function listCoupons() {
  return apiRequest<CouponResponse[]>("/coupons");
}

export function saveCoupon(input: Partial<CouponInput>, id?: string) {
  return id
    ? apiRequest<CouponResponse>(`/coupons/${id}`, jsonInit("PATCH", input))
    : apiRequest<CouponResponse>("/coupons", jsonInit("POST", input));
}

export function deleteCoupon(id: string) {
  return apiRequest<{ message: string }>(`/coupons/${id}`, { method: "DELETE" });
}

export function listAdminReturns(params: URLSearchParams) {
  return apiRequest<{ data: ReturnRequestResponse[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
    `/returns?${params.toString()}`,
  );
}

export function updateReturnStatus(id: string, body: ReturnStatusInput) {
  return apiRequest<ReturnRequestResponse>(`/returns/${id}/status`, jsonInit("PATCH", body));
}

export function listWholesaleRequests(status?: WholesaleRequestStatus) {
  return apiRequest<WholesaleRequestResponse[]>(`/wholesale-requests${status ? `?status=${status}` : ""}`);
}

export function getWholesaleRequest(id: string) {
  return apiRequest<WholesaleRequestResponse>(`/wholesale-requests/${id}`);
}

export function updateWholesaleStatus(id: string, body: { status: "approved" | "rejected" | "info_requested"; note?: string }) {
  return apiRequest<WholesaleRequestResponse>(`/wholesale-requests/${id}/status`, jsonInit("PATCH", body));
}

export function convertWholesaleRequest(id: string, body: ConvertWholesaleInput) {
  return apiRequest<OrderResponse>(`/wholesale-requests/${id}/convert`, jsonInit("POST", body));
}
