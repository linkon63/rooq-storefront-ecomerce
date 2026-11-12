import { mediaSrc, type MediaRef } from "@/utils/media-url";

export type RoleSummary = {
  id: string;
  name: string;
  permissions: { id: string; name: string }[];
};

/** Row shape produced by `userSelect` (lib/server/users/select.ts). */
export type UserRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarMedia: MediaRef | null;
  role: RoleSummary | null;
  createdAt: Date;
  updatedAt: Date;
};

/** The `user` object every auth/user endpoint returns (old userSelect contract). */
export type UserResponse = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  /** Avatar URL — "/api/v1/media/<id>" or an external (Google) URL. */
  avatar: string | null;
  role: RoleSummary | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatar: mediaSrc(row.avatarMedia),
    role: row.role,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
