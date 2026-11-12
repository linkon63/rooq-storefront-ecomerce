import "server-only";
import { z } from "zod";
import { SizeGroup } from "@/lib/generated/prisma/enums";
import { queryBoolean } from "@/lib/server/validation";
import { requiredString, slugField, uuidField } from "../schema-helpers";

export const sizeCreateSchema = z.strictObject({
  label: requiredString("label"),
  slug: slugField.optional(),
  sizeGroup: z.enum(SizeGroup),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
export const sizeUpdateSchema = sizeCreateSchema.partial();
export const sizeListQuery = z.object({ group: z.enum(SizeGroup).optional(), active: queryBoolean.optional() });
export const sizeReorderSchema = z.strictObject({
  items: z.array(z.strictObject({ id: uuidField("id"), sortOrder: z.coerce.number().int() })).min(1),
});

export type SizeCreateInput = z.output<typeof sizeCreateSchema>;
export type SizeUpdateInput = z.output<typeof sizeUpdateSchema>;
export type SizeListQuery = z.output<typeof sizeListQuery>;
