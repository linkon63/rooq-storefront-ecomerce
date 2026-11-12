import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { updateOrderStatusSchema } from "@/lib/server/orders/schemas";
import { updateOrderStatus } from "@/lib/server/orders/status";

type Params = { id: string };

/** PATCH /api/v1/orders/:id/status — admin: { status?, note?, paymentStatus? }. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params, user }) =>
      updateOrderStatus(parseParams(params, idParam).id, await parseBody(request, updateOrderStatusSchema), user),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
