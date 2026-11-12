import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { sizeUpdateSchema } from "@/lib/server/catalog/sizes/schemas";
import { getSize, removeSize, updateSize } from "@/lib/server/catalog/sizes/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getSize(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateSize(parseParams(params, idParam).id, await parseBody(request, sizeUpdateSchema)), STAFF_ONLY),
);

/** DELETE /api/v1/sizes/:id — 409 while variants or size charts use it. */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeSize(parseParams(params, idParam).id), STAFF_ONLY));
