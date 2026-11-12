import type { NextRequest } from "next/server";
import { created, route } from "@/lib/server/http";
import { idParam, parseBody, parseParams, parseValue } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { assertImageFile, fileToBuffer, readFormData } from "@/lib/server/media/upload";
import { saveImage } from "@/lib/server/media/save-image";
import { STAFF_ONLY, formFields, isMultipart } from "@/lib/server/catalog/access";
import { resolveMediaRef } from "@/lib/server/catalog/media";
import { productMediaFormSchema, productMediaJsonSchema, type ProductMediaInput } from "@/lib/server/catalog/products/schemas";
import { addProductMedia, listProductMedia } from "@/lib/server/catalog/products/media-service";
import { badRequest } from "@/lib/server/http-error";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

type Params = { id: string };

/** GET /api/v1/products/:id/media — the flat gallery. */
export const GET = route<Params>((_request, { params }) => listProductMedia(parseParams(params, idParam).id));

async function readMediaInput(request: NextRequest, userId: string): Promise<ProductMediaInput> {
  if (isMultipart(request)) {
    const form = await readFormData(request);
    const file = assertImageFile(form.get("file"));
    const fields = parseValue(formFields(form), productMediaFormSchema);
    const saved = await saveImage(await fileToBuffer(file), { alt: fields.alt ?? null, uploadedById: userId });
    return { ...fields, mediaId: saved.id };
  }
  const body = await parseBody(request, productMediaJsonSchema);
  const mediaId = await resolveMediaRef({ url: body.url, mediaId: body.mediaId });
  if (!mediaId) throw badRequest(ERROR_MESSAGES.media.urlOrIdRequired);
  return { mediaId, colorId: body.colorId, alt: body.alt, isPrimary: body.isPrimary, position: body.position };
}

/** POST /api/v1/products/:id/media — multipart `file` (+ colorId, alt, isPrimary) or JSON { url | mediaId, … }. */
export const POST = route<Params>(
  withAuth<Params>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    return created(await addProductMedia(id, await readMediaInput(request, user.id)));
  }, STAFF_ONLY),
);
