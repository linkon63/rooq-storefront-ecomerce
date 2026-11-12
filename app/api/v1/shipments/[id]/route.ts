import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { updateShipmentSchema } from "@/lib/server/shipments/schemas";
import { updateShipment } from "@/lib/server/shipments/service";

type Params = { id: string };

/** PATCH /api/v1/shipments/:id — admin. */
export const PATCH = route<Params>(
  withAuth<Params>(
    async (request, { params }) => updateShipment(parseParams(params, idParam).id, await parseBody(request, updateShipmentSchema)),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
