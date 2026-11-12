import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { reorderSchema } from "@/lib/server/catalog/products/schemas";
import { reorderProductMedia } from "@/lib/server/catalog/products/media-service";

/** PATCH /api/v1/products/:id/media/reorder — { items: { id, position }[] }. */
export const PATCH = route<{ id: string }>(
  withAuth<{ id: string }>(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return reorderProductMedia(id, (await parseBody(request, reorderSchema)).items);
  }, STAFF_ONLY),
);
