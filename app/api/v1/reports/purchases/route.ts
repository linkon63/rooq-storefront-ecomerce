import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { reportQuerySchema } from "@/lib/server/reports/schemas";
import { reportResponse } from "@/lib/server/reports/respond";
import { getPurchaseReport, purchasesExport } from "@/lib/server/reports/purchases";

/** GET /api/v1/reports/purchases — ?startDate&endDate&page&limit&format=json|csv|pdf */
export const GET = route(
  withAuth((request) => reportResponse(parseQuery(request, reportQuerySchema), getPurchaseReport, purchasesExport), { roles: [ROLES.admin] }),
);
