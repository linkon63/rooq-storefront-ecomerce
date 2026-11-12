import { z } from "zod";
import { route } from "@/lib/server/http";
import { parseParams, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { listActivityLogsByUser } from "@/lib/server/activity-log/service";

const params = z.strictObject({ userId: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });
const query = z.object({ limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional() });

/** GET /api/v1/activity-logs/user/:userId */
export const GET = route<{ userId: string }>(
  withAuth(
    (request, context) =>
      listActivityLogsByUser(parseParams(context.params, params).userId, parseQuery(request, query).limit),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
