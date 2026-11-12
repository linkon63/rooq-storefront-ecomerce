import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { createTag, listTags, tagCreateSchema } from "@/lib/server/catalog/tags/service";

export const GET = route(() => listTags());

export const POST = route(withAuth(async (request) => created(await createTag(await parseBody(request, tagCreateSchema))), STAFF_ONLY));
