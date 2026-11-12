import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseParams } from "@/lib/server/validation";
import { productIdParam } from "@/lib/server/wishlist/schemas";
import { removeFromWishlist } from "@/lib/server/wishlist/service";

type Params = { productId: string };

/** DELETE /api/v1/wishlist/:productId — signed in. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params, user }) => removeFromWishlist(user.id, parseParams(params, productIdParam).productId)),
);
