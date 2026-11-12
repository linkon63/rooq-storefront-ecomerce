import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { reportQuerySchema } from "@/lib/server/reports/schemas";
import { reportResponse } from "@/lib/server/reports/respond";
import { getOverview, overviewExport } from "@/lib/server/reports/overview";

/** GET /api/v1/reports/overview — every report's summary (csv / pdf export too) */
export const GET = route(
  withAuth((request) => reportResponse(parseQuery(request, reportQuerySchema), (range) => getOverview(range), overviewExport), {
    roles: [ROLES.admin],
  }),
);
