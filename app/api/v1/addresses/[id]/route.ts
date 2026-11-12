import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { updateAddressSchema } from "@/lib/server/address/schemas";
import * as addresses from "@/lib/server/address/service";

type Params = { id: string };

/** GET /api/v1/addresses/:id */
export const GET = route<Params>(
  withAuth((_request, { params, user }) => addresses.getAddress(parseParams(params, idParam).id, user.id)),
);

/** PATCH /api/v1/addresses/:id */
export const PATCH = route<Params>(
  withAuth(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    return addresses.updateAddress(id, user.id, await parseBody(request, updateAddressSchema));
  }),
);

/** DELETE /api/v1/addresses/:id */
export const DELETE = route<Params>(
  withAuth((_request, { params, user }) => addresses.removeAddress(parseParams(params, idParam).id, user.id)),
);
