import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { updateCartItemSchema } from "@/lib/server/cart/schemas";
import { removeCartItem, updateCartItem } from "@/lib/server/cart/service";

type Params = { id: string };

/** PATCH /api/v1/cart/items/:id — signed in: { quantity }. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params, user }) =>
    updateCartItem(user.id, parseParams(params, idParam).id, await parseBody(request, updateCartItemSchema)),
  ),
);

/** DELETE /api/v1/cart/items/:id — signed in. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params, user }) => removeCartItem(user.id, parseParams(params, idParam).id)),
);
