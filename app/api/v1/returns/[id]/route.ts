import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { getReturnFor } from "@/lib/server/returns/customer";

type Params = { id: string };

/** GET /api/v1/returns/:id — the owner or staff. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => getReturnFor(parseParams(params, idParam).id, user)),
);
