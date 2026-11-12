import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { movementListQuery } from "@/lib/server/catalog/inventory/schemas";
import { listMovements } from "@/lib/server/catalog/inventory/service";

/** GET /api/v1/inventory/logs — the stock-movement ledger (?variantId&productId&type&from&to). */
export const GET = route(withAuth((request) => listMovements(parseQuery(request, movementListQuery)), STAFF_ONLY));
