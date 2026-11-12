import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { updateProfileSchema } from "@/lib/server/profile/schemas";
import * as profile from "@/lib/server/profile/service";

/** GET /api/v1/profile/me */
export const GET = route(withAuth((_request, { user }) => profile.getMyProfile(user.id)));

/** PATCH /api/v1/profile/me */
export const PATCH = route(
  withAuth(async (request, { user }) => profile.updateMyProfile(user.id, await parseBody(request, updateProfileSchema))),
);
