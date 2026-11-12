import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createReturnSchema, listReturnsQuery } from "@/lib/server/returns/schemas";
import { createReturn } from "@/lib/server/returns/customer";
import { listReturns } from "@/lib/server/returns/admin";

/** POST /api/v1/returns — signed in: open a return / exchange on a delivered order. */
export const POST = route(
  withAuth(async (request, { user }) => created(await createReturn(user, await parseBody(request, createReturnSchema)))),
);

/** GET /api/v1/returns — admin: ?status&search&from&to&page&limit. */
export const GET = route(
  withAuth((request) => listReturns(parseQuery(request, listReturnsQuery)), { roles: [ROLES.admin, ROLES.superadmin] }),
);
