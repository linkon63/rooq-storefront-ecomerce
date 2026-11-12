import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createShipmentSchema } from "@/lib/server/shipments/schemas";
import { createShipment } from "@/lib/server/shipments/service";

/** POST /api/v1/shipments — admin. */
export const POST = route(
  withAuth(async (request) => created(await createShipment(await parseBody(request, createShipmentSchema))), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
