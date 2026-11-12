import { route, created } from "@/lib/server/http";
import { clearAuthCookie } from "@/lib/server/auth/cookies";
import * as auth from "@/lib/server/auth/service";

/**
 * POST /api/v1/auth/logout — clears the access_token cookie. Public on
 * purpose: the old guard 401'd an expired session here, so the cookie was
 * never cleared.
 */
export const POST = route(() => clearAuthCookie(created(auth.logout())));
