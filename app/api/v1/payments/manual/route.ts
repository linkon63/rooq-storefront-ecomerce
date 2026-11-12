import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { manualPaymentSchema } from "@/lib/server/payments/schemas";
import { createManualPayment } from "@/lib/server/payments/service";

/** POST /api/v1/payments/manual — admin: record a payment taken outside a gateway. */
export const POST = route(
  withAuth(async (request) => created(await createManualPayment(await parseBody(request, manualPaymentSchema))), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
