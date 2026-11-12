import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { formBoolean } from "@/utils/form-fields";

const v = ERROR_MESSAGES.validation;
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));
const optionalTrimmed = z.string().trim().optional();

/**
 * POST /news — CreateNewsDto (multipart text fields or JSON). The cover comes
 * as an `image` file, or `coverImageUrl` / `coverMediaId` from POST /upload.
 */
export const createNewsSchema = z.strictObject({
  title: requiredString("title"),
  slug: requiredString("slug"),
  excerpt: optionalTrimmed,
  content: z.string({ error: v.required("content") }).min(1, v.required("content")),
  author: optionalTrimmed,
  isPublished: z.preprocess(formBoolean, z.boolean().optional()),
  /** "" removes the current cover (update only). */
  coverImageUrl: z.string().nullable().optional(),
  coverMediaId: z.string().nullable().optional(),
});
export type CreateNewsInput = z.output<typeof createNewsSchema>;

/** PATCH /news/:id — PartialType(CreateNewsDto) */
export const updateNewsSchema = createNewsSchema.partial();
export type UpdateNewsInput = z.output<typeof updateNewsSchema>;
