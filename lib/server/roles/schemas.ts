import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

const v = ERROR_MESSAGES.validation;
const name = z.string({ error: v.required("name") }).trim().min(1, v.required("name"));
const description = z.string().trim().nullish();

/** POST /roles — CreateRoleDto */
export const createRoleSchema = z.strictObject({ name, description });
/** PATCH /roles/:id — UpdateRoleDto */
export const updateRoleSchema = z.strictObject({ name: name.optional(), description });
/** POST /permissions — CreatePermissionDto */
export const createPermissionSchema = z.strictObject({ name, description });
/** PATCH /roles/:id/permissions — AssignPermissionsDto */
export const assignPermissionsSchema = z.strictObject({
  permissionIds: z.array(z.uuid({ error: v.invalidUuid("permissionIds") })).optional(),
});

export type CreateRoleInput = z.output<typeof createRoleSchema>;
export type UpdateRoleInput = z.output<typeof updateRoleSchema>;
export type CreatePermissionInput = z.output<typeof createPermissionSchema>;
export type AssignPermissionsInput = z.output<typeof assignPermissionsSchema>;
