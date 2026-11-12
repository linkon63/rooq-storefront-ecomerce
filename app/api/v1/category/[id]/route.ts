import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { readBodyWithImage } from "@/lib/server/catalog/image-input";
import { categoryUpdateSchema } from "@/lib/server/catalog/categories/schemas";
import { getCategory, removeCategory, updateCategory } from "@/lib/server/catalog/categories/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getCategory(parseParams(params, idParam).id));

/** PATCH /api/v1/category/:id — JSON or multipart; imageUrl "" removes the image. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const { body, uploadedMediaId } = await readBodyWithImage(request, categoryUpdateSchema, "image", user.id);
    return updateCategory(id, body, uploadedMediaId);
  }, STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeCategory(parseParams(params, idParam).id), STAFF_ONLY));
