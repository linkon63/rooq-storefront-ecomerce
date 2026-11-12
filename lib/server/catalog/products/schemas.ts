import "server-only";
import { z } from "zod";
import { Department, Fit, Occasion, Pattern, ProductStatus, Season } from "@/lib/generated/prisma/enums";
import { queryBoolean } from "@/lib/server/validation";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import {
  formBoolean,
  money,
  nullableDate,
  nullableMoney,
  nullableUuid,
  optionalText,
  requiredString,
  slugField,
  uuidField,
  uuidList,
} from "../schema-helpers";

/** POST /products (PATCH takes the same fields, all optional). */
export const productCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  styleCode: optionalText,
  shortDescription: optionalText,
  description: optionalText,
  status: z.enum(ProductStatus).optional(),
  isFeatured: z.boolean().optional(),
  brandId: uuidField("brandId"),
  categoryId: uuidField("categoryId"),
  unitId: nullableUuid("unitId"),
  supplierId: nullableUuid("supplierId"),
  sizeChartId: nullableUuid("sizeChartId"),
  price: money,
  compareAtPrice: nullableMoney,
  costPrice: nullableMoney,
  department: z.enum(Department).optional(),
  material: optionalText,
  composition: optionalText,
  careInstructions: optionalText,
  fit: z.enum(Fit).nullable().optional(),
  season: z.enum(Season).nullable().optional(),
  occasions: z.array(z.enum(Occasion)).optional(),
  pattern: z.enum(Pattern).nullable().optional(),
  modelInfo: optionalText,
  features: z.array(z.string().trim().min(1)).optional(),
  tagIds: uuidList("tagIds").optional(),
  attributeValueIds: uuidList("attributeValueIds").optional(),
  /** Ordered list of collections the product belongs to (replaces membership). */
  collectionIds: uuidList("collectionIds").optional(),
  metaTitle: optionalText,
  metaDescription: optionalText,
  metaKeywords: optionalText,
  publishedAt: nullableDate,
});

export const productUpdateSchema = productCreateSchema.partial();

export type ProductCreateInput = z.output<typeof productCreateSchema>;
export type ProductUpdateInput = z.output<typeof productUpdateSchema>;

export const productDetailQuery = z.object({ includeArchived: queryBoolean.optional() });

/** POST /products/:id/media as JSON (an already-uploaded image). */
export const productMediaJsonSchema = z
  .strictObject({
    url: z.string().trim().min(1).optional(),
    mediaId: uuidField("mediaId").optional(),
    colorId: nullableUuid("colorId"),
    alt: optionalText,
    isPrimary: z.boolean().optional(),
    position: z.coerce.number().int().min(0).optional(),
  })
  .refine((body) => body.url || body.mediaId, { message: ERROR_MESSAGES.media.urlOrIdRequired, path: ["mediaId"] });

/** Multipart fields that accompany `file`. */
export const productMediaFormSchema = z.object({
  colorId: nullableUuid("colorId"),
  alt: optionalText,
  isPrimary: formBoolean.optional(),
  position: z.coerce.number().int().min(0).optional(),
});

export const productMediaUpdateSchema = z.strictObject({
  colorId: nullableUuid("colorId"),
  position: z.coerce.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  alt: optionalText,
});

export const reorderSchema = z.strictObject({
  items: z.array(z.strictObject({ id: uuidField("id"), position: z.coerce.number().int().min(0) })).min(1),
});

export type ProductMediaInput = { mediaId: string; colorId?: string | null; alt?: string | null; isPrimary?: boolean; position?: number };
export type ProductMediaUpdateInput = z.output<typeof productMediaUpdateSchema>;
