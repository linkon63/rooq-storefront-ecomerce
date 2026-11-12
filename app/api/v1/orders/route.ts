import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createOrderSchema, listOrdersQuery } from "@/lib/server/orders/schemas";
import { createOrderFromCart } from "@/lib/server/orders/checkout";
import { listOrders } from "@/lib/server/orders/queries";

/** POST /api/v1/orders — signed in: place an order from the cart. */
export const POST = route(
  withAuth(async (request, { user }) => created(await createOrderFromCart(user, await parseBody(request, createOrderSchema)))),
);

/** GET /api/v1/orders — admin: search, filter, paginate. */
export const GET = route(
  withAuth((request) => listOrders(parseQuery(request, listOrdersQuery)), { roles: [ROLES.admin, ROLES.superadmin] }),
);
