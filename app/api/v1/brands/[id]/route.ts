import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { readBodyWithImage } from "@/lib/server/catalog/image-input";
import { brandUpdateSchema } from "@/lib/server/catalog/brands/schemas";
import { getBrand, removeBrand, updateBrand } from "@/lib/server/catalog/brands/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getBrand(parseParams(params, idParam).id));

/** PATCH /api/v1/brands/:id — JSON or multipart; logoUrl "" removes the logo. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const { body, uploadedMediaId } = await readBodyWithImage(request, brandUpdateSchema, "logo", user.id);
    return updateBrand(id, body, uploadedMediaId);
  }, STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeBrand(parseParams(params, idParam).id), STAFF_ONLY));
