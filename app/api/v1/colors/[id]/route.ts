import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { colorUpdateSchema } from "@/lib/server/catalog/colors/schemas";
import { getColor, removeColor, updateColor } from "@/lib/server/catalog/colors/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getColor(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateColor(parseParams(params, idParam).id, await parseBody(request, colorUpdateSchema)), STAFF_ONLY),
);

/** DELETE /api/v1/colors/:id — 409 while variants use it. */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeColor(parseParams(params, idParam).id), STAFF_ONLY));
