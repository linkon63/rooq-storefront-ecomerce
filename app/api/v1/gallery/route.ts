import { created, route } from "@/lib/server/http";
import { GALLERY_MAX_PHOTOS, GALLERY_SUBMIT_LIMIT, GALLERY_SUBMIT_WINDOW_MS } from "@/lib/constants/gallery";
import { formFields } from "@/lib/server/catalog/access";
import { gallerySubmitSchema, galleryPublicQuery } from "@/lib/server/gallery/schemas";
import { listPublicGallery, submitGalleryEntry } from "@/lib/server/gallery/service";
import { saveImage } from "@/lib/server/media/save-image";
import { fileToBuffer, imageFiles, readFormData } from "@/lib/server/media/upload";
import { assertWithinRateLimit, clientKey } from "@/lib/server/rate-limit";
import { parseQuery, parseValue } from "@/lib/server/validation";
import { badRequest } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

/** GET /api/v1/gallery — approved customer photos (public), ?source=WEBSITE|FACEBOOK. */
export const GET = route((request) => listPublicGallery(parseQuery(request, galleryPublicQuery).source));

/** POST /api/v1/gallery — public multipart: `photo` file(s), name, rating, feedback, consent. Saved as PENDING. */
export const POST = route(async (request) => {
  assertWithinRateLimit("gallery-submit", clientKey(request), GALLERY_SUBMIT_LIMIT, GALLERY_SUBMIT_WINDOW_MS);
  const form = await readFormData(request);
  const input = parseValue(formFields(form), gallerySubmitSchema);
  const files = imageFiles(form, "photo");
  if (files.length === 0) throw badRequest(ERROR_MESSAGES.gallery.photoRequired);
  if (files.length > GALLERY_MAX_PHOTOS) throw badRequest(ERROR_MESSAGES.gallery.tooManyPhotos(GALLERY_MAX_PHOTOS));
  const mediaIds: string[] = [];
  for (const file of files) mediaIds.push((await saveImage(await fileToBuffer(file), { alt: `Photo by ${input.name}` })).id);
  return created(await submitGalleryEntry(input, mediaIds));
});
