import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { assignPermissionsSchema } from "@/lib/server/roles/schemas";
import * as roles from "@/lib/server/roles/service";

/** PATCH /api/v1/roles/:id/permissions — replace the role's permission set */
export const PATCH = route<{ id: string }>(
  withAuth(
    async (request, { params }) => {
      const { id } = parseParams(params, idParam);
      return roles.assignPermissions(id, await parseBody(request, assignPermissionsSchema));
    },
    { roles: [ROLES.superadmin] },
  ),
);
