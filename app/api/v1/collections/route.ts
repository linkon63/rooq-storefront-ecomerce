import { created, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, isStaffUser } from "@/lib/server/catalog/access";
import { collectionCreateSchema, collectionListQuery } from "@/lib/server/catalog/collections/schemas";
import { createCollection, listCollections } from "@/lib/server/catalog/collections/service";

/** GET /api/v1/collections — live collections/lookbooks (?type, ?featured); staff: ?scope=admin for all. */
export const GET = route(
  withAuth((request, { user }) => listCollections(parseQuery(request, collectionListQuery), isStaffUser(user)), { public: true }),
);

export const POST = route(
  withAuth(async (request) => created(await createCollection(await parseBody(request, collectionCreateSchema))), STAFF_ONLY),
);
