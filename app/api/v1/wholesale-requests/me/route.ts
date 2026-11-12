import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { myWholesaleRequests } from "@/lib/server/wholesale/service";

/** GET /api/v1/wholesale-requests/me — signed in. */
export const GET = route(withAuth((_request, { user }) => myWholesaleRequests(user.id)));
