import { mediaRefSelect } from "../media/select";

export const roleSummarySelect = {
  id: true,
  name: true,
  permissions: { select: { id: true, name: true } },
} as const;

/** Public user fields — feed the row to utils/mappers/user.toUserResponse(). */
export const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarMedia: { select: mediaRefSelect },
  role: { select: roleSummarySelect },
  createdAt: true,
  updatedAt: true,
} as const;

/** userSelect + the secrets/flags auth needs. Never return this to a client. */
export const userAuthSelect = {
  ...userSelect,
  password: true,
  isActive: true,
  deletedAt: true,
} as const;
