import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { attributeUpdateSchema, getAttribute, removeAttribute, updateAttribute } from "@/lib/server/catalog/attributes/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getAttribute(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateAttribute(parseParams(params, idParam).id, await parseBody(request, attributeUpdateSchema)), STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeAttribute(parseParams(params, idParam).id), STAFF_ONLY));
