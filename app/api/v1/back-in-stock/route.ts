import { created, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { backInStockCreateSchema, backInStockListQuery } from "@/lib/server/catalog/back-in-stock/schemas";
import { listBackInStock, requestBackInStock } from "@/lib/server/catalog/back-in-stock/service";

/** POST /api/v1/back-in-stock — "email me when this size is back" (public; user optional). */
export const POST = route(
  withAuth(
    async (request, { user }) => created(await requestBackInStock(await parseBody(request, backInStockCreateSchema), user?.id ?? null)),
    { public: true },
  ),
);

/** GET /api/v1/back-in-stock — admin list (?status&productId&variantId&search). */
export const GET = route(withAuth((request) => listBackInStock(parseQuery(request, backInStockListQuery)), STAFF_ONLY));
