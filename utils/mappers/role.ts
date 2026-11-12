export type PermissionRow = { id: string; name: string; description: string | null; createdAt: Date; updatedAt: Date };

export type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionRow[];
  users?: { id: string; name: string; email: string | null }[];
  _count?: { users: number };
};

export type RoleResponse = Omit<RoleRow, "_count"> & { userCount?: number };

/** Roles answer the old include shape; `users` never carries password hashes. */
export function toRoleResponse(row: RoleRow): RoleResponse {
  const { _count, ...rest } = row;
  return _count ? { ...rest, userCount: _count.users } : rest;
}
