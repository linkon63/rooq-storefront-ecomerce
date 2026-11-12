import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { initiatePaymentSchema } from "@/lib/server/payments/schemas";
import { initiatePayment } from "@/lib/server/payments/service";

/** POST /api/v1/payments/initiate — signed in (order owner or staff). */
export const POST = route(
  withAuth(async (request, { user }) => created(await initiatePayment(await parseBody(request, initiatePaymentSchema), user))),
);
