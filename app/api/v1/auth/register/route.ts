import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { setAuthCookie } from "@/lib/server/auth/cookies";
import { registerSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/register — public. */
export const POST = route(async (request) => {
  const result = await auth.register(await parseBody(request, registerSchema));
  return setAuthCookie(created(result), result.accessToken);
});
