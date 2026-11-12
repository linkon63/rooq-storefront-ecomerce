import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const requiredString = (field: string) => z.string({ error: v.required(field) }).trim().min(1, v.required(field));
const password = (field: string) =>
  z.string({ error: v.required(field) }).min(PASSWORD_MIN_LENGTH, v.minLength(field, PASSWORD_MIN_LENGTH));

/** POST /auth/register — RegisterDto */
export const registerSchema = z.strictObject({
  name: requiredString("name"),
  email: z.email({ error: v.invalidEmail }).trim(),
  phone: requiredString("phone"),
  password: password("password"),
});

/** POST /auth/login — LoginDto (identifier = email or phone; `email` kept for old clients) */
export const loginSchema = z.strictObject({
  identifier: z.string().optional(),
  email: z.string().optional(),
  password: requiredString("password"),
  rememberMe: z.boolean().optional(),
});

/** POST /auth/google — GoogleAuthDto */
export const googleAuthSchema = z.strictObject({
  accessToken: requiredString("accessToken"),
});

/**
 * PATCH /auth/me. The old endpoint reused UpdateUserDto, which let any
 * customer send `roleId` (privilege escalation) or a new password without the
 * current one — both removed; use /auth/change-password.
 */
export const updateMeSchema = z.strictObject({
  name: requiredString("name").optional(),
  email: z.email({ error: v.invalidEmail }).trim().optional(),
  phone: z.string().trim().optional(),
});

export const changePasswordSchema = z.strictObject({
  currentPassword: requiredString("currentPassword"),
  newPassword: password("newPassword"),
});

export const forgotPasswordSchema = z.strictObject({
  email: requiredString("email"),
});

export const resetPasswordSchema = z.strictObject({
  token: requiredString("token"),
  password: password("password"),
});

export type RegisterInput = z.output<typeof registerSchema>;
export type LoginInput = z.output<typeof loginSchema>;
export type UpdateMeInput = z.output<typeof updateMeSchema>;
export type ChangePasswordInput = z.output<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.output<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.output<typeof resetPasswordSchema>;
