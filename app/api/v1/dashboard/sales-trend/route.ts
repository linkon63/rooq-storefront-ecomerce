import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { dashboardQuerySchema } from "@/lib/server/dashboard/schemas";
import { getSalesTrend } from "@/lib/server/dashboard/service";

/** GET /api/v1/dashboard/sales-trend */
export const GET = route(
  withAuth((request) => getSalesTrend(parseQuery(request, dashboardQuerySchema)), { roles: [ROLES.admin] }),
);
