import { route, created } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { changePasswordSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** POST /api/v1/auth/change-password — { currentPassword, newPassword }. */
export const POST = route(
  withAuth(async (request, { user }) =>
    created(await auth.changePassword(user.id, await parseBody(request, changePasswordSchema))),
  ),
);
