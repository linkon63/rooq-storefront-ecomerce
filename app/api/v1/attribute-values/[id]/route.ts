import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { attributeValueUpdateSchema, removeAttributeValue, updateAttributeValue } from "@/lib/server/catalog/attributes/service";

type Params = { id: string };

export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params }) => updateAttributeValue(parseParams(params, idParam).id, await parseBody(request, attributeValueUpdateSchema)),
    STAFF_ONLY,
  ),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeAttributeValue(parseParams(params, idParam).id), STAFF_ONLY));
