import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import type { ShippingAddressInput } from "@/types/storefront/commerce";
import { emailRegex } from "@/utils/regex";
import { normalizeBdPhone } from "@/utils/phone";

const BD_MOBILE = /^01[3-9]\d{8}$/;

export function isValidEmail(value: string): boolean {
  return emailRegex.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return BD_MOBILE.test(normalizeBdPhone(value));
}

/** First problem with a shipping address, or null when it is complete. */
export function addressProblem(address: ShippingAddressInput): string | null {
  if (!address.fullName.trim() || !address.phone.trim() || !address.addressLine1.trim() || !address.city.trim()) {
    return ERROR_MESSAGES.storefront.addressIncomplete;
  }
  if (!isValidPhone(address.phone)) return ERROR_MESSAGES.storefront.phoneInvalid;
  if (address.email && !isValidEmail(address.email)) return ERROR_MESSAGES.storefront.emailInvalid;
  return null;
}

/** Trim every field and drop empty optional ones before sending. */
export function cleanAddress(address: ShippingAddressInput): ShippingAddressInput {
  const optional = (value?: string) => (value && value.trim() ? value.trim() : undefined);
  return {
    email: optional(address.email),
    fullName: address.fullName.trim(),
    phone: normalizeBdPhone(address.phone),
    addressLine1: address.addressLine1.trim(),
    addressLine2: optional(address.addressLine2),
    city: address.city.trim(),
    state: optional(address.state) ?? address.city.trim(),
    postalCode: optional(address.postalCode),
    country: optional(address.country) ?? "Bangladesh",
  };
}

export const EMPTY_ADDRESS: ShippingAddressInput = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Bangladesh",
};

export type RegistrationFields = { name: string; email: string; phone: string; password: string };

/** First problem with a sign-up form, or null. */
export function registrationProblem(fields: RegistrationFields, minPassword: number): string | null {
  if (!fields.name.trim() || !fields.email.trim() || !fields.phone.trim() || !fields.password) {
    return ERROR_MESSAGES.ui.requiredFields;
  }
  if (!isValidEmail(fields.email)) return ERROR_MESSAGES.storefront.emailInvalid;
  if (!isValidPhone(fields.phone)) return ERROR_MESSAGES.storefront.phoneInvalid;
  if (fields.password.length < minPassword) return ERROR_MESSAGES.storefront.passwordTooShort(minPassword);
  return null;
}
