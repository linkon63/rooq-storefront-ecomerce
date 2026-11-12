import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { myOrders } from "@/lib/server/orders/queries";

/** GET /api/v1/orders/my-orders — signed in: own orders, newest first. */
export const GET = route(withAuth((_request, { user }) => myOrders(user.id)));
