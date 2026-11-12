import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createPosOrderSchema } from "@/lib/server/orders/schemas";
import { createPosOrder } from "@/lib/server/orders/checkout";

/** POST /api/v1/orders/pos — admin: ring up an in-store sale (paid + delivered). */
export const POST = route(
  withAuth(
    async (request, { user }) => created(await createPosOrder(user, await parseBody(request, createPosOrderSchema))),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
