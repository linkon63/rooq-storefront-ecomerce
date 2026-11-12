import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { categoryReorderSchema } from "@/lib/server/catalog/categories/schemas";
import { reorderCategories } from "@/lib/server/catalog/categories/service";

/** PATCH /api/v1/category/reorder — full flat list { id, parentId, sortOrder } → the new tree. */
export const PATCH = route(withAuth(async (request) => reorderCategories(await parseBody(request, categoryReorderSchema)), STAFF_ONLY));
