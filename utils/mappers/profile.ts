import { mediaSrc, type MediaRef } from "@/utils/media-url";

export type ProfileRow = {
  id: string;
  bio: string | null;
  dateOfBirth: Date | null;
  department: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    avatarMedia: MediaRef | null;
  };
};

export type AvatarMediaResponse = { id: string; url: string; type: "image"; provider: string };

export type ProfileResponse = {
  id: string;
  bio: string | null;
  dateOfBirth: string | null;
  department: string | null;
  userId: string;
  avatarMediaId: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string | null; phone: string | null; avatar: string | null };
  /** Old include `avatarMedia` — the storefront reads `avatarMedia.url`. */
  avatarMedia: AvatarMediaResponse | null;
};

function avatarMedia(media: MediaRef | null): AvatarMediaResponse | null {
  const url = mediaSrc(media);
  if (!media || !url) return null;
  return { id: media.id, url, type: "image", provider: media.provider.toLowerCase() };
}

export function toProfileResponse(row: ProfileRow): ProfileResponse {
  const { avatarMedia: media, ...user } = row.user;
  return {
    id: row.id,
    bio: row.bio,
    dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toISOString().split("T")[0] : null,
    department: row.department,
    userId: row.userId,
    avatarMediaId: media?.id ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    user: { ...user, avatar: mediaSrc(media) },
    avatarMedia: avatarMedia(media),
  };
}
