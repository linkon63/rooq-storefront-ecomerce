import "server-only";
import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));

/** POST /sections — CreateSectionDto */
export const createSectionSchema = z.strictObject({
  position: z.number({ error: v.required("position") }).int(),
  title: requiredString("title"),
  page: requiredString("page"),
});
export type CreateSectionInput = z.output<typeof createSectionSchema>;

/** PATCH /sections/:id — PartialType(CreateSectionDto) */
export const updateSectionSchema = createSectionSchema.partial();
export type UpdateSectionInput = z.output<typeof updateSectionSchema>;
