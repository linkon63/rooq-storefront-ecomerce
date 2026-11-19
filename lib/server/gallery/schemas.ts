import "server-only";
import { z } from "zod";
import { ReviewStatus } from "@/lib/generated/prisma/enums";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { GALLERY_MAX_CITY, GALLERY_MAX_FEEDBACK, GALLERY_MAX_NAME } from "@/lib/constants/gallery";
import { formBoolean } from "../catalog/schema-helpers";

const m = ERROR_MESSAGES.gallery;

const profileFields = {
  name: z.string({ error: m.nameRequired }).trim().min(1, m.nameRequired).max(GALLERY_MAX_NAME, m.nameTooLong(GALLERY_MAX_NAME)),
  city: z
    .string()
    .trim()
    .max(GALLERY_MAX_CITY)
    .transform((value) => value || null)
    .optional(),
  rating: z.coerce.number({ error: m.ratingInvalid }).int(m.ratingInvalid).min(1, m.ratingInvalid).max(5, m.ratingInvalid),
  feedback: z
    .string({ error: m.feedbackRequired })
    .trim()
    .min(1, m.feedbackRequired)
    .max(GALLERY_MAX_FEEDBACK, m.feedbackTooLong(GALLERY_MAX_FEEDBACK)),
  contactPhone: z
    .string()
    .trim()
    .max(30)
    .transform((value) => value || null)
    .optional(),
};

const entryFields = {
  ...profileFields,
  consent: formBoolean.optional().refine((value) => value === true, m.consentRequired),
};

/** `keep` arrives as a JSON array of the media ids that stay on the entry, in display order. */
const keepIds = z
  .string()
  .default("[]")
  .transform((value, ctx) => {
    try {
      return z.array(z.uuid()).parse(JSON.parse(value));
    } catch {
      ctx.addIssue({ code: "custom", message: m.photoRequired });
      return z.NEVER;
    }
  });

/** POST /gallery — multipart from the storefront form (+ `website` honeypot that must stay empty). */
export const gallerySubmitSchema = z.strictObject({ ...entryFields, website: z.string().max(0).optional() });

/** POST /gallery/admin — multipart; a Facebook screenshot or a customer photo added by staff. */
export const galleryAdminCreateSchema = z.strictObject({
  ...entryFields,
  source: z.enum(["WEBSITE", "FACEBOOK"]),
});

/** PUT /gallery/:id — multipart: edited fields, `keep` (JSON ids of photos to keep) and new `photo` files. */
export const galleryAdminUpdateSchema = z.strictObject({ ...profileFields, source: z.enum(["WEBSITE", "FACEBOOK"]), keep: keepIds });

/** PATCH /gallery/:id */
export const galleryStatusSchema = z.strictObject({ status: z.enum(ReviewStatus) });

/** GET /gallery/admin */
export const galleryAdminQuery = z.object({
  status: z.enum(ReviewStatus).optional(),
  source: z.enum(["WEBSITE", "FACEBOOK"]).optional(),
});

/** GET /gallery */
export const galleryPublicQuery = z.object({ source: z.enum(["WEBSITE", "FACEBOOK"]).optional() });

export type GallerySubmitInput = z.output<typeof gallerySubmitSchema>;
export type GalleryAdminCreateInput = z.output<typeof galleryAdminCreateSchema>;
export type GalleryAdminUpdateInput = z.output<typeof galleryAdminUpdateSchema>;
export type GalleryAdminQuery = z.output<typeof galleryAdminQuery>;
