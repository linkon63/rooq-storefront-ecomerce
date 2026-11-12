import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { createUnit, listUnits, unitCreateSchema } from "@/lib/server/catalog/units/service";

export const GET = route(() => listUnits());

export const POST = route(withAuth(async (request) => created(await createUnit(await parseBody(request, unitCreateSchema))), STAFF_ONLY));
