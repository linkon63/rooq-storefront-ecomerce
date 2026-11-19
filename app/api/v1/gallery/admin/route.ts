import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, formFields } from "@/lib/server/catalog/access";
import { galleryAdminCreateSchema, galleryAdminQuery } from "@/lib/server/gallery/schemas";
import { createAdminGalleryEntry, listAdminGallery } from "@/lib/server/gallery/service";
import { saveImage } from "@/lib/server/media/save-image";
import { fileToBuffer, imageFiles, readFormData } from "@/lib/server/media/upload";
import { parseQuery, parseValue } from "@/lib/server/validation";

/** GET /api/v1/gallery/admin — staff: every entry, ?status=&source=. */
export const GET = route(withAuth((request) => listAdminGallery(parseQuery(request, galleryAdminQuery)), STAFF_ONLY));

/** POST /api/v1/gallery/admin — staff multipart: `photo` file(s) + fields + `source`. Goes live immediately. */
export const POST = route(
  withAuth(async (request, { user }) => {
    const form = await readFormData(request);
    const input = parseValue(formFields(form), galleryAdminCreateSchema);
    const mediaIds: string[] = [];
    for (const file of imageFiles(form, "photo")) {
      mediaIds.push((await saveImage(await fileToBuffer(file), { alt: `Photo by ${input.name}`, uploadedById: user.id })).id);
    }
    return created(await createAdminGalleryEntry(input, mediaIds));
  }, STAFF_ONLY),
);
