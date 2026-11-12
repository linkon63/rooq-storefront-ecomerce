import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { getSupplier, removeSupplier, supplierUpdateSchema, updateSupplier } from "@/lib/server/catalog/suppliers/service";

type Params = { id: string };

export const GET = route<Params>(withAuth<Params>((_request, { params }) => getSupplier(parseParams(params, idParam).id), STAFF_ONLY));

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateSupplier(parseParams(params, idParam).id, await parseBody(request, supplierUpdateSchema)), STAFF_ONLY),
);

export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => removeSupplier(parseParams(params, idParam).id), STAFF_ONLY));
