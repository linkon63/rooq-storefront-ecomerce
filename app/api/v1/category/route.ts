import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { readBodyWithImage } from "@/lib/server/catalog/image-input";
import { categoryCreateSchema } from "@/lib/server/catalog/categories/schemas";
import { createCategory, listCategoryTree } from "@/lib/server/catalog/categories/service";

/** GET /api/v1/category — the category tree (3 levels). */
export const GET = route(() => listCategoryTree());

/** POST /api/v1/category — JSON or multipart with an `image` file. */
export const POST = route(
  withAuth(async (request, { user }) => {
    const { body, uploadedMediaId } = await readBodyWithImage(request, categoryCreateSchema, "image", user.id);
    return created(await createCategory(body, uploadedMediaId));
  }, STAFF_ONLY),
);
