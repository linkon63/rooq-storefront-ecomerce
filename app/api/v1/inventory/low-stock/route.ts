import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { lowStockQuery } from "@/lib/server/catalog/inventory/schemas";
import { lowStockReport } from "@/lib/server/catalog/inventory/service";

/** GET /api/v1/inventory/low-stock — dashboard alert: low variants (lowest first) + low/out counts. */
export const GET = route(withAuth((request) => lowStockReport(parseQuery(request, lowStockQuery).limit), STAFF_ONLY));
