import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { lookUpdateSchema } from "@/lib/server/catalog/collections/schemas";
import { removeLook, updateLook } from "@/lib/server/catalog/collections/looks";

type Params = { id: string };

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateLook(parseParams(params, idParam).id, await parseBody(request, lookUpdateSchema)), STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeLook(parseParams(params, idParam).id), STAFF_ONLY));
