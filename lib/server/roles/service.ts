import "server-only";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { SUCCESS_MESSAGES } from "@/lib/constants/success-messages";
import { ROLES } from "@/lib/constants/auth";
import { toRoleResponse, type PermissionRow, type RoleResponse } from "@/utils/mappers/role";
import { prisma } from "../prisma";
import { badRequest, notFound } from "../http-error";
import type {
  AssignPermissionsInput,
  CreatePermissionInput,
  CreateRoleInput,
  UpdateRoleInput,
} from "./schemas";

/** Users are listed without password hashes (the old include leaked them). */
const roleListInclude = {
  permissions: { orderBy: { name: "asc" } },
  users: { where: { deletedAt: null }, select: { id: true, name: true, email: true } },
} as const;

const PROTECTED_ROLES: readonly string[] = [ROLES.superadmin, ROLES.admin];

async function ensureRole(id: string) {
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) throw notFound(ERROR_MESSAGES.role.notFound(id));
  return role;
}

export async function createRole(input: CreateRoleInput): Promise<RoleResponse> {
  return toRoleResponse(await prisma.role.create({ data: input }));
}

export async function listRoles(): Promise<RoleResponse[]> {
  const roles = await prisma.role.findMany({ include: roleListInclude, orderBy: { createdAt: "asc" } });
  return roles.map(toRoleResponse);
}

export async function updateRole(id: string, input: UpdateRoleInput): Promise<RoleResponse> {
  const role = await ensureRole(id);
  // Guards match on the name — renaming a protected role would lock staff out.
  if (input.name !== undefined && input.name !== role.name && (role.isSystem || PROTECTED_ROLES.includes(role.name))) {
    throw badRequest(ERROR_MESSAGES.role.protected(role.name));
  }
  return toRoleResponse(await prisma.role.update({ where: { id }, data: input }));
}

export async function removeRole(id: string): Promise<{ message: string }> {
  const role = await ensureRole(id);
  if (role.isSystem || PROTECTED_ROLES.includes(role.name)) throw badRequest(ERROR_MESSAGES.role.protected(role.name));
  const usersWithRole = await prisma.user.count({ where: { roleId: id } });
  if (usersWithRole > 0) throw badRequest(ERROR_MESSAGES.role.stillAssigned(usersWithRole));
  await prisma.role.delete({ where: { id } });
  return { message: SUCCESS_MESSAGES.common.deleted("Role") };
}

export function createPermission(input: CreatePermissionInput): Promise<PermissionRow> {
  return prisma.permission.create({ data: input });
}

export function listPermissions(): Promise<PermissionRow[]> {
  return prisma.permission.findMany({ orderBy: { createdAt: "desc" } });
}

export async function assignPermissions(roleId: string, input: AssignPermissionsInput): Promise<RoleResponse> {
  await ensureRole(roleId);
  const role = await prisma.role.update({
    where: { id: roleId },
    data: { permissions: { set: input.permissionIds?.map((id) => ({ id })) ?? [] } },
    include: { permissions: { orderBy: { name: "asc" } } },
  });
  return toRoleResponse(role);
}
