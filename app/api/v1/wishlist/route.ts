import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { addWishlistSchema } from "@/lib/server/wishlist/schemas";
import { addToWishlist, listWishlist } from "@/lib/server/wishlist/service";

/** POST /api/v1/wishlist — signed in: { productId }. */
export const POST = route(
  withAuth(async (request, { user }) => created(await addToWishlist(user.id, await parseBody(request, addWishlistSchema)))),
);

/** GET /api/v1/wishlist — signed in. */
export const GET = route(withAuth((_request, { user }) => listWishlist(user.id)));
