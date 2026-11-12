import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { updateMeSchema } from "@/lib/server/auth/schemas";
import * as auth from "@/lib/server/auth/service";

/** GET /api/v1/auth/me — the signed-in user. */
export const GET = route(withAuth((_request, { user }) => auth.me(user.id)));

/** PATCH /api/v1/auth/me — update name / email / phone. */
export const PATCH = route(
  withAuth(async (request, { user }) => auth.updateMe(user.id, await parseBody(request, updateMeSchema))),
);
