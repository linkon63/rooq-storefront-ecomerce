import "server-only";
import { z } from "zod";
import { CollectionType } from "@/lib/generated/prisma/enums";
import { paginationQuery, queryBoolean } from "@/lib/server/validation";
import { nullableDate, nullableUuid, optionalText, requiredString, slugField, uuidList } from "../schema-helpers";

export const collectionCreateSchema = z.strictObject({
  name: requiredString("name"),
  slug: slugField.optional(),
  type: z.enum(CollectionType).optional(),
  description: optionalText,
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  position: z.coerce.number().int().optional(),
  startsAt: nullableDate,
  endsAt: nullableDate,
  coverImageUrl: z.string().trim().nullable().optional(),
  coverMediaId: nullableUuid("coverMediaId"),
  productIds: uuidList("productIds").optional(),
  metaTitle: optionalText,
  metaDescription: optionalText,
});
export const collectionUpdateSchema = collectionCreateSchema.partial();

export const collectionListQuery = z.object({
  type: z.enum(CollectionType).optional(),
  featured: queryBoolean.optional(),
  scope: z.enum(["admin", "public"]).optional(),
  search: z.string().trim().optional(),
});

export const collectionDetailQuery = z.object({ ...paginationQuery, facets: queryBoolean.optional() });

export const lookCreateSchema = z.strictObject({
  title: optionalText,
  description: optionalText,
  imageUrl: z.string().trim().nullable().optional(),
  mediaId: nullableUuid("mediaId"),
  productIds: uuidList("productIds").default([]),
  position: z.coerce.number().int().optional(),
});
export const lookUpdateSchema = lookCreateSchema.partial().extend({ productIds: uuidList("productIds").optional() });

export type CollectionCreateInput = z.output<typeof collectionCreateSchema>;
export type CollectionUpdateInput = z.output<typeof collectionUpdateSchema>;
export type CollectionListQuery = z.output<typeof collectionListQuery>;
export type CollectionDetailQuery = z.output<typeof collectionDetailQuery>;
export type LookCreateInput = z.output<typeof lookCreateSchema>;
export type LookUpdateInput = z.output<typeof lookUpdateSchema>;
