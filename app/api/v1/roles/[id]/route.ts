import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { updateRoleSchema } from "@/lib/server/roles/schemas";
import * as roles from "@/lib/server/roles/service";

const superadmin = { roles: [ROLES.superadmin] } as const;
type Params = { id: string };

/** PATCH /api/v1/roles/:id */
export const PATCH = route<Params>(
  withAuth(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return roles.updateRole(id, await parseBody(request, updateRoleSchema));
  }, superadmin),
);

/** DELETE /api/v1/roles/:id */
export const DELETE = route<Params>(withAuth((_request, { params }) => roles.removeRole(parseParams(params, idParam).id), superadmin));
