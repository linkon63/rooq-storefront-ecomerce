import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { cancelOwnReturn } from "@/lib/server/returns/customer";

type Params = { id: string };

/** POST /api/v1/returns/:id/cancel — the owner, while the request is still REQUESTED. */
export const POST = route<Params>(
  withAuth<Params>(async (_request, { params, user }) => created(await cancelOwnReturn(parseParams(params, idParam).id, user))),
);
