import "server-only";
import { z } from "zod";
import { HERO_MOBILE_MAX } from "@/lib/constants/storefront";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { HeroMode } from "@/lib/generated/prisma/enums";
import { formBoolean, nullableUuid, uuidField, uuidList } from "../catalog/schema-helpers";

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

/** PUT /hero-slides/mobile — the phone hero's products in order, each with an optional photo (null = main image). */
export const heroMobileSchema = z.strictObject({
  items: z
    .array(z.strictObject({ productId: uuidField("productId"), mediaId: nullableUuid("mediaId").transform((value) => value ?? null) }))
    .max(HERO_MOBILE_MAX, { error: ERROR_MESSAGES.heroSlide.mobileTooMany(HERO_MOBILE_MAX) })
    .refine((items) => new Set(items.map((item) => item.productId)).size === items.length, { error: ERROR_MESSAGES.heroSlide.mobileDuplicate }),
});

export type HeroMobileInput = z.output<typeof heroMobileSchema>;
export type HeroSlideCreateInput = z.output<typeof heroSlideCreateSchema>;
export type HeroSlideUpdateInput = z.output<typeof heroSlideUpdateSchema>;
