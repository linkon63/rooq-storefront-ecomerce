import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { forgotPasswordSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/forgot-password — public. { email } → emails a reset link. */
export const POST = route(async (request) =>
  created(await auth.forgotPassword(await parseBody(request, forgotPasswordSchema))),
);
