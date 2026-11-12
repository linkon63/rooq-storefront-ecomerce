import { z } from "zod";
import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { shipmentsForOrder } from "@/lib/server/shipments/service";

type Params = { orderId: string };
const params = z.strictObject({ orderId: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });

/** GET /api/v1/shipments/order/:orderId — admin. */
export const GET = route<Params>(
  withAuth<Params>((_request, context) => shipmentsForOrder(parseParams(context.params, params).orderId), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
