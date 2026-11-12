import "server-only";
import { z } from "zod";
import { formBoolean, nullableUuid, optionalText, requiredString, slugField } from "../schema-helpers";

/** POST /brands — JSON or multipart with a `logo` file. */
export const brandCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  logoUrl: z.string().trim().nullable().optional(),
  logoMediaId: nullableUuid("logoMediaId"),
  description: optionalText,
  isActive: formBoolean.optional(),
});
export const brandUpdateSchema = brandCreateSchema.partial();

export type BrandCreateInput = z.output<typeof brandCreateSchema>;
export type BrandUpdateInput = z.output<typeof brandUpdateSchema>;
