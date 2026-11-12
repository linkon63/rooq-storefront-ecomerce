import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { setAuthCookie } from "@/lib/server/auth/cookies";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/refresh-token — new access token for the signed-in user. */
export const POST = route(
  withAuth(async (_request, { user }) => {
    const result = await auth.refreshToken(user.id);
    return setAuthCookie(created(result), result.accessToken);
  }),
);
