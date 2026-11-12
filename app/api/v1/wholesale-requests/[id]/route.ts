import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { loadWholesale } from "@/lib/server/wholesale/service";

type Params = { id: string };

/** GET /api/v1/wholesale-requests/:id — admin (includes the customer's addresses). */
export const GET = route<Params>(
  withAuth<Params>((_request, { params }) => loadWholesale(parseParams(params, idParam).id), { roles: [ROLES.admin] }),
);
