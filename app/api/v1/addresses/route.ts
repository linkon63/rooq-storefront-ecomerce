import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { createAddressSchema } from "@/lib/server/address/schemas";
import * as addresses from "@/lib/server/address/service";

/** POST /api/v1/addresses */
export const POST = route(
  withAuth(async (request, { user }) =>
    created(await addresses.createAddress(user.id, await parseBody(request, createAddressSchema))),
  ),
);

/** GET /api/v1/addresses — default first, then newest */
export const GET = route(withAuth((_request, { user }) => addresses.listAddresses(user.id)));
