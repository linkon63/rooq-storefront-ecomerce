import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { heroSlideUpdateSchema } from "@/lib/server/hero-slides/schemas";
import { deleteHeroSlide, updateHeroSlide } from "@/lib/server/hero-slides/service";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";

type Params = { id: string };

/** PATCH /api/v1/hero-slides/:id — `productId` (null unlinks) and/or `isActive`. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => updateHeroSlide(parseParams(params, idParam).id, await parseBody(request, heroSlideUpdateSchema)), STAFF_ONLY),
);

/** DELETE /api/v1/hero-slides/:id — removes the slide and frees its image. */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => deleteHeroSlide(parseParams(params, idParam).id), STAFF_ONLY));
