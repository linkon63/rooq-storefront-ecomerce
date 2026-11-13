import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, formFields } from "@/lib/server/catalog/access";
import { heroSlideCreateSchema } from "@/lib/server/hero-slides/schemas";
import { createHeroSlides, listHeroSlides } from "@/lib/server/hero-slides/service";
import { saveImage } from "@/lib/server/media/save-image";
import { fileToBuffer, imageFiles, readFormData } from "@/lib/server/media/upload";
import { parseValue } from "@/lib/server/validation";

/** GET /api/v1/hero-slides — every slide in order, active or not (admin). */
export const GET = route(withAuth(() => listHeroSlides(), STAFF_ONLY));

/** POST /api/v1/hero-slides — multipart: one or more `image` files, optional `productId` (single image only). */
export const POST = route(
  withAuth(async (request, { user }) => {
    const form = await readFormData(request);
    const input = parseValue(formFields(form), heroSlideCreateSchema);
    const mediaIds: string[] = [];
    for (const file of imageFiles(form, "image")) {
      mediaIds.push((await saveImage(await fileToBuffer(file), { uploadedById: user.id, alt: "Hero slide" })).id);
    }
    return created(await createHeroSlides(mediaIds, input.productId));
  }, STAFF_ONLY),
);
