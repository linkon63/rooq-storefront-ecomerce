import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { attributeCreateSchema, createAttribute, listAttributes } from "@/lib/server/catalog/attributes/service";

/** GET /api/v1/attributes — descriptive facets (neckline, sleeve…) with their values. */
export const GET = route(() => listAttributes());

export const POST = route(withAuth(async (request) => created(await createAttribute(await parseBody(request, attributeCreateSchema))), STAFF_ONLY));
