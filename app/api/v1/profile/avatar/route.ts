import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { assertImageFile, fileToBuffer, readFormData } from "@/lib/server/media/upload";
import * as profile from "@/lib/server/profile/service";

/** POST /api/v1/profile/avatar — multipart field `avatar`; stored in the database as WebP. */
export const POST = route(
  withAuth(async (request, { user }) => {
    const form = await readFormData(request);
    const file = assertImageFile(form.get("avatar"));
    return created(await profile.uploadAvatar(user.id, await fileToBuffer(file)));
  }),
);

/** DELETE /api/v1/profile/avatar */
export const DELETE = route(withAuth((_request, { user }) => profile.deleteAvatar(user.id)));
