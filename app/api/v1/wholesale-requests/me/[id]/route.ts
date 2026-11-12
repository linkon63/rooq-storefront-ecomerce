import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseParams } from "@/lib/server/validation";
import { prisma } from "@/lib/server/prisma";
import { loadWholesale } from "@/lib/server/wholesale/service";

type Params = { id: string };

/** GET /api/v1/wholesale-requests/me/:id — signed in: one of your own requests. */
export const GET = route<Params>(
  withAuth<Params>((_request, { params, user }) => loadWholesale(parseParams(params, idParam).id, prisma, user.id)),
);
