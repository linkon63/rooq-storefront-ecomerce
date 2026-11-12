import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { backInStockSummary } from "@/lib/server/catalog/back-in-stock/service";

/** GET /api/v1/back-in-stock/summary — pending requests per variant, most requested first. */
export const GET = route(withAuth(() => backInStockSummary(), STAFF_ONLY));
