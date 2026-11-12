import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { setAuthCookie } from "@/lib/server/auth/cookies";
import { loginSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/login — public. Body: { identifier | email, password, rememberMe? } */
export const POST = route(async (request) => {
  const input = await parseBody(request, loginSchema);
  const result = await auth.login(input);
  return setAuthCookie(created(result), result.accessToken, input.rememberMe);
});
