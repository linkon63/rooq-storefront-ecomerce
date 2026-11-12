import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { sizeReorderSchema } from "@/lib/server/catalog/sizes/schemas";
import { reorderSizes } from "@/lib/server/catalog/sizes/service";

/** PATCH /api/v1/sizes/reorder — { items: { id, sortOrder }[] }. */
export const PATCH = route(withAuth(async (request) => reorderSizes((await parseBody(request, sizeReorderSchema)).items), STAFF_ONLY));
