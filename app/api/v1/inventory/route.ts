import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { inventoryListQuery } from "@/lib/server/catalog/inventory/schemas";
import { listInventory } from "@/lib/server/catalog/inventory/service";

/** GET /api/v1/inventory — variants with stock (?search&productId&lowStock&outOfStock). */
export const GET = route(withAuth((request) => listInventory(parseQuery(request, inventoryListQuery)), STAFF_ONLY));
