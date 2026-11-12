import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { ROLES } from "@/lib/constants/auth";
import type { Prisma } from "@/lib/generated/prisma/client";
import { normalizeBdPhone, phoneVariants } from "@/utils/phone";
import { toUserResponse, type UserResponse } from "@/utils/mappers/user";
import { prisma } from "../prisma";
import { badRequest, conflict, notFound } from "../http-error";
import { hashPassword } from "../auth/password";
import { userSelect } from "./select";
import type { CreateUserInput, UpdateUserInput } from "./schemas";

/** Staff-management view of a user: the public fields + account state. */
const managedUserSelect = { ...userSelect, isActive: true, lastLoginAt: true } as const;

export type ManagedUser = UserResponse & { isActive: boolean; lastLoginAt: Date | null };

type ManagedRow = Prisma.UserGetPayload<{ select: typeof managedUserSelect }>;

function toManagedUser(row: ManagedRow): ManagedUser {
  return { ...toUserResponse(row), isActive: row.isActive, lastLoginAt: row.lastLoginAt };
}

async function assertEmailFree(email: string, exceptId?: string): Promise<void> {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing && existing.id !== exceptId) throw conflict(ERROR_MESSAGES.auth.emailExists);
}

async function assertPhoneFree(phone: string, exceptId?: string): Promise<void> {
  const existing = await prisma.user.findFirst({
    where: { OR: phoneVariants(phone).map((value) => ({ phone: value })) },
    select: { id: true },
  });
  if (existing && existing.id !== exceptId) throw conflict(ERROR_MESSAGES.auth.phoneExists);
}

async function findManaged(id: string): Promise<ManagedRow> {
  const user = await prisma.user.findFirst({ where: { id, deletedAt: null }, select: managedUserSelect });
  if (!user) throw notFound(ERROR_MESSAGES.user.notFoundById(id));
  return user;
}

export async function createUser(input: CreateUserInput): Promise<ManagedUser> {
  await assertEmailFree(input.email);
  await assertPhoneFree(input.phone);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: normalizeBdPhone(input.phone),
      password: await hashPassword(input.password),
      roleId: input.roleId,
    },
    select: managedUserSelect,
  });
  return toManagedUser(user);
}

/** Every account that has not been deleted, newest first. */
export async function listUsers(): Promise<ManagedUser[]> {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: managedUserSelect,
    orderBy: { createdAt: "desc" },
  });
  return users.map(toManagedUser);
}

export async function getUser(id: string): Promise<ManagedUser> {
  return toManagedUser(await findManaged(id));
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<ManagedUser> {
  const existing = await findManaged(id);
  const isSuperadmin = existing.role?.name === ROLES.superadmin;

  if (isSuperadmin && input.roleId !== undefined && input.roleId !== existing.role?.id) {
    throw badRequest(ERROR_MESSAGES.user.superadminDemote);
  }
  if (isSuperadmin && input.isActive === false) throw badRequest(ERROR_MESSAGES.user.superadminDemote);
  if (input.email !== undefined) await assertEmailFree(input.email, id);
  if (input.phone) await assertPhoneFree(input.phone, id);

  const data: Prisma.UserUncheckedUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.email !== undefined) data.email = input.email;
  if (input.phone !== undefined) data.phone = normalizeBdPhone(input.phone) || null;
  if (input.roleId !== undefined) data.roleId = input.roleId;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password !== undefined) data.password = await hashPassword(input.password);

  const user = await prisma.user.update({ where: { id }, data, select: managedUserSelect });
  return toManagedUser(user);
}

/**
 * Soft delete: orders, reviews and stock movements keep pointing at the row.
 * The account is disabled and its sessions revoked in the same transaction.
 */
export async function removeUser(id: string): Promise<{ message: string }> {
  const user = await findManaged(id);
  if (user.role?.name === ROLES.superadmin) throw badRequest(ERROR_MESSAGES.user.superadminDelete);
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { deletedAt: now, isActive: false } }),
    prisma.userSession.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: now } }),
  ]);
  return { message: SUCCESS_MESSAGES.common.deleted("User") };
}
