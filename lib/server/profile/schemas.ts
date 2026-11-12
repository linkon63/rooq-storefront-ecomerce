import { z } from "zod";

const DEPARTMENTS = ["MEN", "WOMEN", "KIDS", "UNISEX"] as const;

/** PATCH /profile/me — UpdateProfileDto (+ fashion preferences). */
export const updateProfileSchema = z.strictObject({
  bio: z.string().trim().nullish(),
  /** "YYYY-MM-DD" */
  dateOfBirth: z.iso.date().nullish(),
  department: z.enum(DEPARTMENTS).nullish(),
});

export type UpdateProfileInput = z.output<typeof updateProfileSchema>;
