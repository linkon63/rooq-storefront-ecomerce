import { apiRequest } from "@/lib/api";
import type { SavedAddress, ShippingAddressInput } from "@/types/storefront/commerce";

/** The signed-in shopper's address book (`/addresses`), shared by checkout and profile. */

export type AddressInput = ShippingAddressInput & { label?: string; isDefault?: boolean };

export function listAddresses(): Promise<SavedAddress[]> {
  return apiRequest<SavedAddress[] | { data: SavedAddress[] }>("/addresses").then((payload) =>
    Array.isArray(payload) ? payload : (payload.data ?? []),
  );
}

/** The address DTO has no email field (strict body), so it is stripped before sending. */
function withoutEmail<T extends { email?: string }>(input: T): Omit<T, "email"> {
  const body = { ...input };
  delete body.email;
  return body;
}

export function createAddress(input: AddressInput): Promise<SavedAddress> {
  return apiRequest<SavedAddress>("/addresses", { method: "POST", body: withoutEmail(input) });
}

export function updateAddress(id: string, input: Partial<AddressInput>): Promise<SavedAddress> {
  return apiRequest<SavedAddress>(`/addresses/${encodeURIComponent(id)}`, { method: "PATCH", body: withoutEmail(input) });
}

export function deleteAddress(id: string): Promise<unknown> {
  return apiRequest(`/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function setDefaultAddress(id: string): Promise<SavedAddress> {
  return apiRequest<SavedAddress>(`/addresses/${encodeURIComponent(id)}/set-default`, { method: "PATCH" });
}
