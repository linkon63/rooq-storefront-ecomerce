import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));
const optionalString = z.string().trim().nullish();

/** POST /addresses — CreateAddressDto (+ optional label, "Home" / "Office"). */
export const createAddressSchema = z.strictObject({
  label: optionalString,
  fullName: requiredString("fullName"),
  phone: requiredString("phone"),
  addressLine1: requiredString("addressLine1"),
  addressLine2: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
  isDefault: z.boolean().optional(),
});

/** PATCH /addresses/:id — PartialType(CreateAddressDto) */
export const updateAddressSchema = z.strictObject({
  label: optionalString,
  fullName: requiredString("fullName").optional(),
  phone: requiredString("phone").optional(),
  addressLine1: requiredString("addressLine1").optional(),
  addressLine2: optionalString,
  city: requiredString("city").optional(),
  state: optionalString,
  postalCode: optionalString,
  country: requiredString("country").optional(),
  isDefault: z.boolean().optional(),
});

export type CreateAddressInput = z.output<typeof createAddressSchema>;
export type UpdateAddressInput = z.output<typeof updateAddressSchema>;
