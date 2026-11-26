import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { route } from "@/lib/server/http";
import { reelUpdateSchema } from "@/lib/server/reels/schemas";
import { deleteReel, updateReel } from "@/lib/server/reels/service";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";

type Params = { id: string };

/** PATCH /api/v1/reels/:id — `productId` and/or `isActive`. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateReel(parseParams(params, idParam).id, await parseBody(request, reelUpdateSchema)), STAFF_ONLY),
);

/** DELETE /api/v1/reels/:id — removes the reel and its video. */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => deleteReel(parseParams(params, idParam).id), STAFF_ONLY));
