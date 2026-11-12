import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { getCart } from "@/lib/server/cart/service";

/** GET /api/v1/cart — signed in. */
export const GET = route(withAuth((_request, { user }) => getCart(user.id)));
