import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { cancelOwnOrder } from "@/lib/server/orders/status";

type Params = { id: string };

/** DELETE /api/v1/orders/:id/cancel — signed in: cancel your own order before it ships. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params, user }) => cancelOwnOrder(parseParams(params, idParam).id, user)),
);
