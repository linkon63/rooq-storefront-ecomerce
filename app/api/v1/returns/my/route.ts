import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseQuery } from "@/lib/server/validation";
import { myReturnsQuery } from "@/lib/server/returns/schemas";
import { myReturns } from "@/lib/server/returns/customer";

/** GET /api/v1/returns/my — signed in: own return requests, paginated. */
export const GET = route(withAuth((request, { user }) => myReturns(user.id, parseQuery(request, myReturnsQuery))));
