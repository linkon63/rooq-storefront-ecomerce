import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { assertImageFile, fileToBuffer, readFormData } from "@/lib/server/media/upload";
import { saveImage } from "@/lib/server/media/save-image";

/**
 * POST /api/v1/upload — admin only, multipart `file` (+ optional `folder`,
 * accepted for old clients and ignored). Stores the image in the database
 * and answers `{ url, id }` where url = "/api/v1/media/<id>".
 */
export const POST = route(
  withAuth(
    async (request, { user }) => {
      const form = await readFormData(request);
      const file = assertImageFile(form.get("file"));
      const alt = form.get("alt");
      const saved = await saveImage(await fileToBuffer(file), {
        alt: typeof alt === "string" && alt.trim() ? alt.trim() : null,
        uploadedById: user.id,
      });
      return created({ url: saved.url, id: saved.id, width: saved.width, height: saved.height });
    },
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
