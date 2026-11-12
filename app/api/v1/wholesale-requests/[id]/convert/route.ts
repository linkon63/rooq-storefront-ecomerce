import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { convertWholesaleSchema } from "@/lib/server/wholesale/schemas";
import { convertWholesaleRequest } from "@/lib/server/wholesale/convert";

type Params = { id: string };

/** POST /api/v1/wholesale-requests/:id/convert — admin: approved request → wholesale order. */
export const POST = route<Params>(
  withAuth<Params>(
    async (request, { params, user }) =>
      created(await convertWholesaleRequest(parseParams(params, idParam).id, await parseBody(request, convertWholesaleSchema), user)),
    { roles: [ROLES.admin] },
  ),
);
