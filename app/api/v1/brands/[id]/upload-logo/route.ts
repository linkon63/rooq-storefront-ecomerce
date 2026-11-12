import { created, route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { assertImageFile, fileToBuffer, readFormData } from "@/lib/server/media/upload";
import { saveImage } from "@/lib/server/media/save-image";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { setBrandLogo } from "@/lib/server/catalog/brands/service";

/** POST /api/v1/brands/:id/upload-logo — multipart `logo`. */
export const POST = route<{ id: string }>(
  withAuth<{ id: string }>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const file = assertImageFile((await readFormData(request)).get("logo"));
    const saved = await saveImage(await fileToBuffer(file), { uploadedById: user.id });
    return created(await setBrandLogo(id, saved.id));
  }, STAFF_ONLY),
);
