import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { resetPasswordSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/reset-password — public. { token, password }. */
export const POST = route(async (request) =>
  created(await auth.resetPassword(await parseBody(request, resetPasswordSchema))),
);
