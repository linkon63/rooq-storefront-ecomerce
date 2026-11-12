import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { parseBody } from "@/lib/server/validation";
import { createSectionSchema } from "@/lib/server/sections/schemas";
import { createSection, listSections } from "@/lib/server/sections/service";

/** GET /api/v1/sections — public, ordered by position (`?page=home` narrows to one page). */
export const GET = route((request) => listSections(request.nextUrl.searchParams.get("page") ?? undefined));

/** POST /api/v1/sections — admin. */
export const POST = route(
  withAuth(async (request) => created(await createSection(await parseBody(request, createSectionSchema))), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
