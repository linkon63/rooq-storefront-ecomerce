import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { route } from "@/lib/server/http";
import { reelReorderSchema } from "@/lib/server/reels/schemas";
import { reorderReels } from "@/lib/server/reels/service";
import { parseBody } from "@/lib/server/validation";

/** PUT /api/v1/reels/reorder — `{ ids }`: every reel id in the new order. */
export const PUT = route(withAuth(async (request) => reorderReels((await parseBody(request, reelReorderSchema)).ids), STAFF_ONLY));
