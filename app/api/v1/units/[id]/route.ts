import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { getUnit, removeUnit, unitUpdateSchema, updateUnit } from "@/lib/server/catalog/units/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getUnit(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateUnit(parseParams(params, idParam).id, await parseBody(request, unitUpdateSchema)), STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeUnit(parseParams(params, idParam).id), STAFF_ONLY));
