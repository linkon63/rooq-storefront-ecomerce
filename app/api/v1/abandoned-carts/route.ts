import { ok, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { abandonedCartListQuery, abandonedCartSchema } from "@/lib/server/abandoned-carts/schemas";
import { listAbandonedCarts, saveAbandonedCart } from "@/lib/server/abandoned-carts/service";

/** POST /api/v1/abandoned-carts — checkout in progress (public: name + phone + cart). */
export const POST = route(async (request) => ok(await saveAbandonedCart(await parseBody(request, abandonedCartSchema))));

/** GET /api/v1/abandoned-carts — admin list (?status&search&page&limit). */
export const GET = route(withAuth((request) => listAbandonedCarts(parseQuery(request, abandonedCartListQuery)), STAFF_ONLY));
