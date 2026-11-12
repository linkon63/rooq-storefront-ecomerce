import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { getOrderFor } from "@/lib/server/orders/queries";

type Params = { id: string };

/** GET /api/v1/orders/:id — signed in: own order, or any order for staff. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => getOrderFor(parseParams(params, idParam).id, user)),
);
