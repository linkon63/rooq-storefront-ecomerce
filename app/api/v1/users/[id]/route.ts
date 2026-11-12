import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { updateUserSchema } from "@/lib/server/users/schemas";
import * as users from "@/lib/server/users/service";

const superadmin = { roles: [ROLES.superadmin] } as const;
type Params = { id: string };

/** GET /api/v1/users/:id */
export const GET = route<Params>(withAuth((_request, { params }) => users.getUser(parseParams(params, idParam).id), superadmin));

/** PUT /api/v1/users/:id */
export const PUT = route<Params>(
  withAuth(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return users.updateUser(id, await parseBody(request, updateUserSchema));
  }, superadmin),
);

/** DELETE /api/v1/users/:id — soft delete */
export const DELETE = route<Params>(withAuth((_request, { params }) => users.removeUser(parseParams(params, idParam).id), superadmin));
