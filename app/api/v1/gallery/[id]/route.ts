import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, formFields } from "@/lib/server/catalog/access";
import { galleryAdminUpdateSchema, galleryStatusSchema } from "@/lib/server/gallery/schemas";
import { deleteGalleryEntry, setGalleryStatus, updateAdminGalleryEntry } from "@/lib/server/gallery/service";
import { saveImage } from "@/lib/server/media/save-image";
import { fileToBuffer, imageFiles, readFormData } from "@/lib/server/media/upload";
import { idParam, parseBody, parseParams, parseValue } from "@/lib/server/validation";

type Params = { id: string };

/** PUT /api/v1/gallery/:id — staff multipart edit: fields, `keep` (JSON media ids) and new `photo` files. */
export const PUT = route<Params>(
  withAuth<Params>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const form = await readFormData(request);
    const input = parseValue(formFields(form), galleryAdminUpdateSchema);
    const mediaIds: string[] = [];
    for (const file of imageFiles(form, "photo")) {
      mediaIds.push((await saveImage(await fileToBuffer(file), { alt: `Photo by ${input.name}`, uploadedById: user.id })).id);
    }
    return updateAdminGalleryEntry(id, input, mediaIds);
  }, STAFF_ONLY),
);

/** PATCH /api/v1/gallery/:id — staff: approve, reject or move back to pending. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { status } = await parseBody(request, galleryStatusSchema);
    return setGalleryStatus(parseParams(params, idParam).id, status);
  }, STAFF_ONLY),
);

/** DELETE /api/v1/gallery/:id — staff. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params }) => deleteGalleryEntry(parseParams(params, idParam).id), STAFF_ONLY),
);
