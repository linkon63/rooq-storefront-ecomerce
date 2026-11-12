import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { phoneVariants } from "@/utils/phone";
import { toUserResponse, type UserResponse } from "@/utils/mappers/user";
import { prisma } from "../prisma";
import { notFound } from "../http-error";
import { userAuthSelect, userSelect } from "./select";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email: email.trim() }, select: userAuthSelect });
}

export function findUserByPhone(phone: string) {
  return prisma.user.findFirst({
    where: { OR: phoneVariants(phone).map((value) => ({ phone: value })) },
    select: userAuthSelect,
  });
}

/** Login lookup: email, or any stored shape of a BD phone number. */
export function findUserByIdentifier(identifier: string) {
  const clean = identifier.trim();
  return prisma.user.findFirst({
    where: {
      deletedAt: null,
      OR: [{ email: clean }, ...phoneVariants(clean).map((value) => ({ phone: value }))],
    },
    select: userAuthSelect,
  });
}

/** Public user by id, or 404 "User with id … not found". */
export async function getUserOrThrow(id: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
  if (!user) throw notFound(ERROR_MESSAGES.user.notFoundById(id));
  return toUserResponse(user);
}
