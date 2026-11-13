import "server-only";
import { z } from "zod";
import { HeroMode } from "@/lib/generated/prisma/enums";
import { formBoolean, nullableUuid, uuidList } from "../catalog/schema-helpers";

/** POST /hero-slides — multipart: `image` file(s) plus an optional `productId` for a single image. */
export const heroSlideCreateSchema = z.strictObject({
  productId: nullableUuid("productId"),
});

/** PATCH /hero-slides/:id — link or unlink a product, show or hide the slide. */
export const heroSlideUpdateSchema = z.strictObject({
  productId: nullableUuid("productId"),
  isActive: formBoolean.optional(),
});

/** PUT /hero-slides/reorder — every slide id, in the new order. */
export const heroSlideReorderSchema = z.strictObject({ ids: uuidList("ids").min(1) });

/** PUT /hero-slides/mode — what the home hero shows. */
export const heroModeSchema = z.strictObject({ mode: z.enum(HeroMode) });

export type HeroSlideCreateInput = z.output<typeof heroSlideCreateSchema>;
export type HeroSlideUpdateInput = z.output<typeof heroSlideUpdateSchema>;
