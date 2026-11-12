import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createWholesaleSchema, listWholesaleQuery } from "@/lib/server/wholesale/schemas";
import { createWholesaleRequest, listWholesaleRequests } from "@/lib/server/wholesale/service";

/** POST /api/v1/wholesale-requests — signed in: submit a request. */
export const POST = route(
  withAuth(async (request, { user }) =>
    created(await createWholesaleRequest(user.id, await parseBody(request, createWholesaleSchema))),
  ),
);

/** GET /api/v1/wholesale-requests — admin: ?status=. */
export const GET = route(
  withAuth((request) => listWholesaleRequests(parseQuery(request, listWholesaleQuery)), { roles: [ROLES.admin] }),
);
