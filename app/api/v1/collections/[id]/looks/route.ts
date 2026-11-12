import { created, route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { lookCreateSchema } from "@/lib/server/catalog/collections/schemas";
import { createLook } from "@/lib/server/catalog/collections/looks";

/** POST /api/v1/collections/:id/looks — add a "shop the look" scene. */
export const POST = route<{ id: string }>(
  withAuth<{ id: string }>(
    async (request, { params }) => created(await createLook(parseParams(params, idParam).id, await parseBody(request, lookCreateSchema))),
    STAFF_ONLY,
  ),
);
