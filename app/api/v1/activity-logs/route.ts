import { z } from "zod";
import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { MAX_PAGE_SIZE } from "@/lib/constants/pagination";
import { listActivityLogs } from "@/lib/server/activity-log/service";

const query = z.object({ limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).optional() });

/** GET /api/v1/activity-logs — newest first, with the acting user */
export const GET = route(
  withAuth((request) => listActivityLogs(parseQuery(request, query).limit), { roles: [ROLES.admin, ROLES.superadmin] }),
);
