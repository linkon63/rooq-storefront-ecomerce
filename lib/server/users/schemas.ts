import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));
const password = z.string({ error: v.required("password") }).min(PASSWORD_MIN_LENGTH, v.minLength("password", PASSWORD_MIN_LENGTH));
const roleId = z.uuid({ error: v.invalidUuid("roleId") });

/** POST /users — CreateUserDto */
export const createUserSchema = z.strictObject({
  name: requiredString("name"),
  email: z.email({ error: v.invalidEmail }).trim(),
  password,
  phone: requiredString("phone"),
  roleId: roleId.optional(),
});

/** PUT /users/:id — UpdateUserDto (+ isActive to disable an account) */
export const updateUserSchema = z.strictObject({
  name: requiredString("name").optional(),
  email: z.email({ error: v.invalidEmail }).trim().optional(),
  password: password.optional(),
  phone: z.string().trim().optional(),
  roleId: roleId.optional(),
  isActive: z.boolean().optional(),
});

export type CreateUserInput = z.output<typeof createUserSchema>;
export type UpdateUserInput = z.output<typeof updateUserSchema>;
