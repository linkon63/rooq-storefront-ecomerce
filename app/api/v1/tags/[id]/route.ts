import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { getTag, removeTag, tagUpdateSchema, updateTag } from "@/lib/server/catalog/tags/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getTag(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateTag(parseParams(params, idParam).id, await parseBody(request, tagUpdateSchema)), STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeTag(parseParams(params, idParam).id), STAFF_ONLY));
