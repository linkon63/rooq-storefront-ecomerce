import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { updateWholesaleStatusSchema } from "@/lib/server/wholesale/schemas";
import { updateWholesaleStatus } from "@/lib/server/wholesale/service";

type Params = { id: string };

/** PATCH /api/v1/wholesale-requests/:id/status — admin: approve / reject / info_requested. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params }) =>
      updateWholesaleStatus(parseParams(params, idParam).id, await parseBody(request, updateWholesaleStatusSchema)),
    { roles: [ROLES.admin] },
  ),
);
