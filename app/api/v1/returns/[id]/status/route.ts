import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { updateReturnStatusSchema } from "@/lib/server/returns/schemas";
import { updateReturnStatus } from "@/lib/server/returns/admin";

type Params = { id: string };

/** PATCH /api/v1/returns/:id/status — admin: approve / reject / refund / exchange. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params, user }) =>
      updateReturnStatus(parseParams(params, idParam).id, await parseBody(request, updateReturnStatusSchema), user),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
