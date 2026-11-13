import "server-only";
import { z } from "zod";
import { formBoolean, nullableUuid, optionalText, requiredString, slugField, uuidField } from "../schema-helpers";

/** POST /category — JSON or multipart (`image` file + string fields). */
export const categoryCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  parentId: nullableUuid("parentId"),
  /** "" removes the image; an /api/v1/media/<id> url sets it. */
  imageUrl: z.string().trim().nullable().optional(),
  imageMediaId: nullableUuid("imageMediaId"),
  description: optionalText,
  sortOrder: z.coerce.number().int().min(0).optional(),
  isActive: formBoolean.optional(),
  isComingSoon: formBoolean.optional(),
  sizeChartId: nullableUuid("sizeChartId"),
  metaTitle: optionalText,
  metaDescription: optionalText,
});
export const categoryUpdateSchema = categoryCreateSchema.partial();

export const categoryReorderSchema = z.strictObject({
  items: z
    .array(
      z.strictObject({
        id: uuidField("id"),
        parentId: z.string().nullable().optional(),
        sortOrder: z.coerce.number().int().min(0),
      }),
    )
    .min(1),
});

export type CategoryCreateInput = z.output<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.output<typeof categoryUpdateSchema>;
export type CategoryReorderInput = z.output<typeof categoryReorderSchema>;
