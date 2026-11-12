import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { readBodyWithImage } from "@/lib/server/catalog/image-input";
import { brandCreateSchema } from "@/lib/server/catalog/brands/schemas";
import { createBrand, listBrands } from "@/lib/server/catalog/brands/service";

export const GET = route(() => listBrands());

/** POST /api/v1/brands — JSON or multipart with a `logo` file. */
export const POST = route(
  withAuth(async (request, { user }) => {
    const { body, uploadedMediaId } = await readBodyWithImage(request, brandCreateSchema, "logo", user.id);
    return created(await createBrand(body, uploadedMediaId));
  }, STAFF_ONLY),
);
