"use client";

/**
 * The customer address book — `/addresses` on the API, owned by the logged-in
 * user. Both the profile screen and the checkout read and write through here so
 * an address saved in one place is immediately pickable in the other.
 */

import { getCustomerToken } from "./storefront-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export type CustomerAddress = {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

export type AddressInput = Omit<CustomerAddress, "id" | "isDefault"> & { isDefault?: boolean };

async function addressRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCustomerToken();
  if (!token) throw new Error("Please sign in to manage your addresses.");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    const message = (payload as { message?: string | string[] }).message;
    throw new Error(
      Array.isArray(message) ? message.join(", ") : message || "Address request failed",
    );
  }

  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/** Default address first — that is the one checkout should preselect. */
export async function fetchMyAddresses(): Promise<CustomerAddress[]> {
  const addresses = await addressRequest<CustomerAddress[]>("/addresses");
  return [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export function createAddress(input: AddressInput): Promise<CustomerAddress> {
  return addressRequest<CustomerAddress>("/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateAddress(id: string, input: Partial<AddressInput>): Promise<CustomerAddress> {
  return addressRequest<CustomerAddress>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteAddress(id: string): Promise<void> {
  return addressRequest<void>(`/addresses/${id}`, { method: "DELETE" });
}

export function setDefaultAddress(id: string): Promise<CustomerAddress> {
  return addressRequest<CustomerAddress>(`/addresses/${id}/set-default`, { method: "PATCH" });
}

/** One-line rendering used on the address cards. */
export function formatAddress(address: CustomerAddress): string {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}
