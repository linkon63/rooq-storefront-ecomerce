import { noContent, route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { removeAbandonedCart } from "@/lib/server/abandoned-carts/service";

/** DELETE /api/v1/abandoned-carts/:id — staff clear a cart they have followed up. */
export const DELETE = route<{ id: string }>(
  withAuth<{ id: string }>(async (_request, { params }) => {
    await removeAbandonedCart(parseParams(params, idParam).id);
    return noContent();
  }, STAFF_ONLY),
);
