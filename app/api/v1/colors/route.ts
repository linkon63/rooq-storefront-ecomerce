import { created, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { colorCreateSchema, colorListQuery } from "@/lib/server/catalog/colors/schemas";
import { createColor, listColors } from "@/lib/server/catalog/colors/service";

/** GET /api/v1/colors — colour master (?active=true). */
export const GET = route((request) => listColors(parseQuery(request, colorListQuery)));

export const POST = route(withAuth(async (request) => created(await createColor(await parseBody(request, colorCreateSchema))), STAFF_ONLY));
