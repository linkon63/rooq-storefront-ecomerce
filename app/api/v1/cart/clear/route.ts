import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { clearCart } from "@/lib/server/cart/service";

/** DELETE /api/v1/cart/clear — signed in. */
export const DELETE = route(withAuth((_request, { user }) => clearCart(user.id)));
