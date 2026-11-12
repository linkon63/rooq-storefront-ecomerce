import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { markDelivered } from "@/lib/server/shipments/service";

type Params = { id: string };

/** PATCH /api/v1/shipments/:id/delivered — admin. */
export const PATCH = route<Params>(
  withAuth<Params>((_request, { params, user }) => markDelivered(parseParams(params, idParam).id, user), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
