import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { collectionUpdateSchema } from "@/lib/server/catalog/collections/schemas";
import { getCollectionAdmin, removeCollection, updateCollection } from "@/lib/server/catalog/collections/service";

type Params = { id: string };

export const GET = route<Params>(withAuth<Params>((_request, { params }) => getCollectionAdmin(parseParams(params, idParam).id), STAFF_ONLY));

/** PATCH — `productIds` (ordered) replaces membership. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params }) => updateCollection(parseParams(params, idParam).id, await parseBody(request, collectionUpdateSchema)),
    STAFF_ONLY,
  ),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeCollection(parseParams(params, idParam).id), STAFF_ONLY));
