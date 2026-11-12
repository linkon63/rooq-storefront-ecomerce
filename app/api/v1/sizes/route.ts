import { created, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { sizeCreateSchema, sizeListQuery } from "@/lib/server/catalog/sizes/schemas";
import { createSize, listSizes } from "@/lib/server/catalog/sizes/service";

/** GET /api/v1/sizes — size master (?group=ALPHA&active=true), in display order. */
export const GET = route((request) => listSizes(parseQuery(request, sizeListQuery)));

export const POST = route(withAuth(async (request) => created(await createSize(await parseBody(request, sizeCreateSchema))), STAFF_ONLY));
