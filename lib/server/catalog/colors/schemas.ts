import "server-only";
import { z } from "zod";
import { queryBoolean } from "@/lib/server/validation";
import { hexField, optionalText, requiredString, slugField } from "../schema-helpers";

export const colorCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  hex: hexField,
  family: optionalText,
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const colorUpdateSchema = colorCreateSchema.partial();
export const colorListQuery = z.object({ active: queryBoolean.optional(), search: z.string().trim().optional() });

export type ColorCreateInput = z.output<typeof colorCreateSchema>;
export type ColorUpdateInput = z.output<typeof colorUpdateSchema>;
export type ColorListQuery = z.output<typeof colorListQuery>;
