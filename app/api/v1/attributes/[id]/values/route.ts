import { created, route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { attributeValueCreateSchema, createAttributeValue, listAttributeValues } from "@/lib/server/catalog/attributes/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => listAttributeValues(parseParams(params, idParam).id));

export const POST = route<Params>(
  withAuth<Params>(
    async (request, { params }) =>
      created(await createAttributeValue(parseParams(params, idParam).id, await parseBody(request, attributeValueCreateSchema))),
    STAFF_ONLY,
  ),
);
