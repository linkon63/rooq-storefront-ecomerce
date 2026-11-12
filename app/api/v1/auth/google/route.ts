import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { setAuthCookie } from "@/lib/server/auth/cookies";
import { googleAuthSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/google — public. Body: { accessToken } (Google OAuth access token). */
export const POST = route(async (request) => {
  const { accessToken } = await parseBody(request, googleAuthSchema);
  const result = await auth.googleAuth(accessToken);
  return setAuthCookie(created(result), result.accessToken, true);
});
