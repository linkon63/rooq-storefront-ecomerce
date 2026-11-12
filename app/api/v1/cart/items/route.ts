import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { addCartItemSchema } from "@/lib/server/cart/schemas";
import { addCartItem } from "@/lib/server/cart/service";

/** POST /api/v1/cart/items — signed in: { variantId, quantity }. */
export const POST = route(
  withAuth(async (request, { user }) => created(await addCartItem(user.id, await parseBody(request, addCartItemSchema)))),
);
