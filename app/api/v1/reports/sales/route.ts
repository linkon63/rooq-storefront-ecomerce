import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { reportQuerySchema } from "@/lib/server/reports/schemas";
import { reportResponse } from "@/lib/server/reports/respond";
import { getSalesReport, salesExport } from "@/lib/server/reports/sales";

/** GET /api/v1/reports/sales — ?startDate&endDate&page&limit&format=json|csv|pdf */
export const GET = route(
  withAuth((request) => reportResponse(parseQuery(request, reportQuerySchema), getSalesReport, salesExport), { roles: [ROLES.admin] }),
);
