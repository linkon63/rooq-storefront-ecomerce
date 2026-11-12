import { z } from "zod";
import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseParams } from "@/lib/server/validation";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { orderPayments } from "@/lib/server/payments/service";

type Params = { orderId: string };
const params = z.strictObject({ orderId: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });

/** GET /api/v1/payments/order/:orderId — order owner or staff. */
export const GET = route<Params>(
  withAuth<Params>((_request, context) => orderPayments(parseParams(context.params, params).orderId, context.user)),
);
