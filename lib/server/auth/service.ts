import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { PASSWORD_RESET_TTL_MS, ROLES } from "@/lib/constants/auth";
import { STORE_NAME } from "@/lib/constants/store";
import { normalizeBdPhone, phoneVariants } from "@/utils/phone";
import { toUserResponse, type UserResponse } from "@/utils/mappers/user";
import { passwordResetEmail } from "@/utils/mail-templates/password-reset";
import { prisma } from "../prisma";
import { badRequest, conflict, notFound, unauthorized } from "../http-error";
import { saveExternalMedia } from "../media/save-image";
import { sendMail } from "../mail/client";
import { userSelect } from "../users/select";
import { findUserByEmail, findUserByIdentifier, getUserOrThrow } from "../users/queries";
import { signAccessToken } from "./jwt";
import { hashPassword, hashToken, randomToken, verifyPassword } from "./password";
import { fetchGoogleProfile } from "./google";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateMeInput,
} from "./schemas";

export type AuthResult = { accessToken: string; user: UserResponse };
export type MessageResult = { message: string };

async function customerRoleId(): Promise<string | undefined> {
  const role = await prisma.role.findUnique({ where: { name: ROLES.customer }, select: { id: true } });
  return role?.id;
}

async function assertEmailFree(email: string, exceptUserId?: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email: email.trim() }, select: { id: true } });
  if (existing && existing.id !== exceptUserId) throw conflict(ERROR_MESSAGES.auth.emailExists);
}

async function assertPhoneFree(phone: string, exceptUserId?: string): Promise<void> {
  const existing = await prisma.user.findFirst({
    where: { OR: phoneVariants(phone).map((value) => ({ phone: value })) },
    select: { id: true },
  });
  if (existing && existing.id !== exceptUserId) throw conflict(ERROR_MESSAGES.auth.phoneExists);
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  await assertEmailFree(input.email);
  await assertPhoneFree(input.phone);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: normalizeBdPhone(input.phone),
      password: await hashPassword(input.password),
      roleId: await customerRoleId(),
    },
    select: userSelect,
  });

  return { accessToken: await signAccessToken(user.id), user: toUserResponse(user) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const identifier = (input.identifier || input.email)?.trim();
  if (!identifier) throw badRequest(ERROR_MESSAGES.auth.identifierRequired);

  const user = await findUserByIdentifier(identifier);
  if (!user) throw unauthorized(ERROR_MESSAGES.auth.invalidCredentials);
  if (!user.password) throw unauthorized(ERROR_MESSAGES.auth.googleOnlyAccount);
  if (!(await verifyPassword(input.password, user.password))) {
    throw unauthorized(ERROR_MESSAGES.auth.invalidCredentials);
  }
  if (!user.isActive) throw unauthorized(ERROR_MESSAGES.auth.accountDisabled);

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return { accessToken: await signAccessToken(user.id), user: toUserResponse(user) };
}

export async function googleAuth(googleAccessToken: string): Promise<AuthResult> {
  const profile = await fetchGoogleProfile(googleAccessToken);
  if (!profile.email) throw unauthorized(ERROR_MESSAGES.auth.googleNoEmail);
  if (profile.email_verified === false) throw unauthorized(ERROR_MESSAGES.auth.googleEmailUnverified);
  const email = profile.email;

  // Match by Google identity first, then by email, so an email/password
  // account gets linked rather than duplicated.
  const existing = await prisma.user.findFirst({
    where: { OR: [{ googleId: profile.sub }, { email }] },
    select: { id: true, googleId: true, avatarMediaId: true, emailVerifiedAt: true, isActive: true },
  });

  let userId: string;
  if (existing) {
    if (!existing.isActive) throw unauthorized(ERROR_MESSAGES.auth.accountDisabled);
    userId = existing.id;
    if (!existing.googleId) {
      const avatar =
        !existing.avatarMediaId && profile.picture ? await saveExternalMedia(profile.picture) : null;
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          googleId: profile.sub,
          avatarMediaId: existing.avatarMediaId ?? avatar?.id ?? null,
          emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
        },
      });
    }
  } else {
    const avatar = profile.picture ? await saveExternalMedia(profile.picture) : null;
    const created = await prisma.user.create({
      data: {
        name: profile.name || email.split("@")[0],
        email,
        googleId: profile.sub,
        avatarMediaId: avatar?.id ?? null,
        provider: "google",
        emailVerifiedAt: new Date(),
        roleId: await customerRoleId(),
      },
      select: { id: true },
    });
    userId = created.id;
  }

  await prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  return { accessToken: await signAccessToken(userId), user: await getUserOrThrow(userId) };
}

export function me(userId: string): Promise<UserResponse> {
  return getUserOrThrow(userId);
}

export async function refreshToken(userId: string): Promise<{ accessToken: string }> {
  return { accessToken: await signAccessToken(userId) };
}

export async function updateMe(userId: string, input: UpdateMeInput): Promise<UserResponse> {
  if (input.email) await assertEmailFree(input.email, userId);
  if (input.phone) await assertPhoneFree(input.phone, userId);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.phone !== undefined ? { phone: normalizeBdPhone(input.phone) || null } : {}),
    },
    select: userSelect,
  });
  return toUserResponse(user);
}

export function logout(): MessageResult {
  return { message: SUCCESS_MESSAGES.auth.loggedOut };
}

export async function changePassword(userId: string, input: ChangePasswordInput): Promise<MessageResult> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) throw notFound(ERROR_MESSAGES.user.notFound);
  if (!user.password) throw unauthorized(ERROR_MESSAGES.auth.googleOnlyNoPassword);
  if (!(await verifyPassword(input.currentPassword, user.password))) {
    throw unauthorized(ERROR_MESSAGES.auth.currentPasswordIncorrect);
  }
  await prisma.user.update({ where: { id: userId }, data: { password: await hashPassword(input.newPassword) } });
  return { message: SUCCESS_MESSAGES.auth.passwordChanged };
}

/**
 * Emails a one-hour reset link. The answer is the same whether or not the
 * email exists (no account enumeration). Outside production the raw token is
 * also returned, as the old endpoint did, so the flow can be tested locally.
 */
export async function forgotPassword(input: ForgotPasswordInput): Promise<MessageResult & { token?: string }> {
  const user = await findUserByEmail(input.email);
  if (!user || !user.email || user.deletedAt) return { message: SUCCESS_MESSAGES.auth.resetTokenMaybe };

  const token = randomToken();
  await prisma.passwordReset.create({
    data: {
      email: user.email,
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const settings = await prisma.setting.findFirst({ select: { shopName: true } });
  const mail = passwordResetEmail({
    name: user.name,
    shopName: settings?.shopName ?? STORE_NAME,
    resetUrl: `${appUrl}/reset-password?token=${encodeURIComponent(token)}`,
  });
  await sendMail({ to: user.email, subject: mail.subject, html: mail.html });

  return process.env.NODE_ENV === "production"
    ? { message: SUCCESS_MESSAGES.auth.resetTokenMaybe }
    : { message: SUCCESS_MESSAGES.auth.resetTokenGenerated, token };
}

export async function resetPassword(input: ResetPasswordInput): Promise<MessageResult> {
  const reset = await prisma.passwordReset.findFirst({
    where: { tokenHash: hashToken(input.token), usedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, userId: true },
  });
  if (!reset) throw unauthorized(ERROR_MESSAGES.auth.resetTokenInvalid);

  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { password: await hashPassword(input.password) } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
  ]);
  return { message: SUCCESS_MESSAGES.auth.passwordReset };
}
