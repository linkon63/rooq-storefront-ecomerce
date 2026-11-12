import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { dashboardQuerySchema } from "@/lib/server/dashboard/schemas";
import { getTopProducts } from "@/lib/server/dashboard/service";

/** GET /api/v1/dashboard/top-products */
export const GET = route(
  withAuth((request) => getTopProducts(parseQuery(request, dashboardQuerySchema)), { roles: [ROLES.admin] }),
);
