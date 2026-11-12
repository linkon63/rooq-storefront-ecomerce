import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import type { Department } from "@/lib/generated/prisma/enums";
import { toProfileResponse, type ProfileResponse } from "@/utils/mappers/profile";
import { prisma } from "../prisma";
import { badRequest } from "../http-error";
import { mediaRefSelect } from "../media/select";
import { saveImage } from "../media/save-image";
import { releaseMedia } from "../media/release";
import type { UpdateProfileInput } from "./schemas";

const profileInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, avatarMedia: { select: mediaRefSelect } } },
} as const;

type ProfileFields = { bio?: string | null; dateOfBirth?: Date | null; department?: Department | null };

/** Profile row, created on first read (the old upsert). */
function ensureProfile(userId: string, fields: ProfileFields = {}) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: fields,
    create: { userId, ...fields },
    include: profileInclude,
  });
}

export async function getMyProfile(userId: string): Promise<ProfileResponse> {
  return toProfileResponse(await ensureProfile(userId));
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput): Promise<ProfileResponse> {
  const fields: ProfileFields = {};
  if (input.bio !== undefined) fields.bio = input.bio;
  if (input.dateOfBirth !== undefined) fields.dateOfBirth = input.dateOfBirth ? new Date(input.dateOfBirth) : null;
  if (input.department !== undefined) fields.department = input.department;
  return toProfileResponse(await ensureProfile(userId, fields));
}

/** Stores the avatar in the database (WebP) and drops the previous one. */
export async function uploadAvatar(userId: string, file: Buffer | null): Promise<ProfileResponse> {
  if (!file) throw badRequest(ERROR_MESSAGES.profile.avatarRequired);
  const previous = await prisma.user.findUnique({ where: { id: userId }, select: { avatarMediaId: true } });
  const saved = await saveImage(file, { alt: null, uploadedById: userId });
  await prisma.user.update({ where: { id: userId }, data: { avatarMediaId: saved.id } });
  if (previous?.avatarMediaId && previous.avatarMediaId !== saved.id) await releaseMedia(previous.avatarMediaId);
  return getMyProfile(userId);
}

export async function deleteAvatar(userId: string): Promise<{ message: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { avatarMediaId: true } });
  if (!user?.avatarMediaId) return { message: ERROR_MESSAGES.profile.noAvatar };
  await prisma.user.update({ where: { id: userId }, data: { avatarMediaId: null } });
  await releaseMedia(user.avatarMediaId);
  return { message: SUCCESS_MESSAGES.common.deleted("Avatar") };
}
