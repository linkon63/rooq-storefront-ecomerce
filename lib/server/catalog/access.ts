import "server-only";
import type { NextRequest } from "next/server";
import { ROLES } from "@/lib/constants/auth";
import { isStaffRole } from "@/utils/roles";
import type { CurrentUser } from "@/lib/server/auth/current-user";

/** @Roles('admin', 'superadmin') — every catalog write. */
export const STAFF_ONLY = { roles: [ROLES.admin, ROLES.superadmin] } as const;

export function isStaffUser(user: CurrentUser | null | undefined): boolean {
  return isStaffRole(user?.role?.name);
}

/** True when the request body is multipart (old FileInterceptor endpoints). */
export function isMultipart(request: NextRequest): boolean {
  return (request.headers.get("content-type") ?? "").includes("multipart/form-data");
}

/** String fields of a multipart form (files dropped). */
export function formFields(form: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of form.entries()) if (typeof value === "string") out[key] = value;
  return out;
}
