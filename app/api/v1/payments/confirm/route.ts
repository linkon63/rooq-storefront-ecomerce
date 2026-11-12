import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { confirmPaymentSchema } from "@/lib/server/payments/schemas";
import { confirmPayment } from "@/lib/server/payments/service";

/** POST /api/v1/payments/confirm — admin: settle a payment (success marks the order paid). */
export const POST = route(
  withAuth(async (request) => created(await confirmPayment(await parseBody(request, confirmPaymentSchema))), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
