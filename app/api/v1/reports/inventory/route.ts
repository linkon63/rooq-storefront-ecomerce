import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { reportQuerySchema } from "@/lib/server/reports/schemas";
import { reportResponse } from "@/lib/server/reports/respond";
import { getInventoryReport, inventoryExport } from "@/lib/server/reports/inventory";

/** GET /api/v1/reports/inventory — ?startDate&endDate&page&limit&format=json|csv|pdf */
export const GET = route(
  withAuth((request) => reportResponse(parseQuery(request, reportQuerySchema), getInventoryReport, inventoryExport), { roles: [ROLES.admin] }),
);
