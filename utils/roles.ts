import { ROLES, STAFF_ROLES } from "@/lib/constants/auth";

/**
 * RolesGuard semantics from the old backend: no required roles → allowed;
 * superadmin → always allowed; otherwise the user's role name must be listed.
 */
export function hasRequiredRole(roleName: string | null | undefined, required: readonly string[]): boolean {
  if (required.length === 0) return true;
  if (!roleName) return false;
  if (roleName === ROLES.superadmin) return true;
  return required.includes(roleName);
}

/** May this role open the admin panel? (admin or superadmin) */
export function isStaffRole(roleName: string | null | undefined): boolean {
  return !!roleName && STAFF_ROLES.includes(roleName);
}
