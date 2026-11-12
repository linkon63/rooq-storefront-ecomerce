import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { returnableFor } from "@/lib/server/returns/customer";

type Params = { id: string };

/** GET /api/v1/orders/:id/returnable — signed in: what can still be returned, and until when. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => returnableFor(parseParams(params, idParam).id, user)),
);
