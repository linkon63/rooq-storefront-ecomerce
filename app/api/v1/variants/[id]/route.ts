import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { variantUpdateSchema } from "@/lib/server/catalog/variants/schemas";
import { getVariant, removeVariant, updateVariant } from "@/lib/server/catalog/variants/service";

type Params = { id: string };

export const GET = route<Params>((_request, { params }) => getVariant(parseParams(params, idParam).id));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return updateVariant(id, await parseBody(request, variantUpdateSchema));
  }, STAFF_ONLY),
);

/** DELETE /api/v1/variants/:id — deletes, or archives when it has order/stock history. */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeVariant(parseParams(params, idParam).id), STAFF_ONLY));
