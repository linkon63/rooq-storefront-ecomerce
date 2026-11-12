import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { reportQuerySchema } from "@/lib/server/reports/schemas";
import { reportResponse } from "@/lib/server/reports/respond";
import { getDiscountReport, discountsExport } from "@/lib/server/reports/discounts";

/** GET /api/v1/reports/discounts — ?startDate&endDate&page&limit&format=json|csv|pdf */
export const GET = route(
  withAuth((request) => reportResponse(parseQuery(request, reportQuerySchema), getDiscountReport, discountsExport), { roles: [ROLES.admin] }),
);
