import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { productMediaUpdateSchema } from "@/lib/server/catalog/products/schemas";
import { removeProductMedia, updateProductMedia } from "@/lib/server/catalog/products/media-service";

type Params = { id: string };

/** PATCH /api/v1/product-media/:id — colour, position, primary flag, alt text. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return updateProductMedia(id, await parseBody(request, productMediaUpdateSchema));
  }, STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeProductMedia(parseParams(params, idParam).id), STAFF_ONLY));
