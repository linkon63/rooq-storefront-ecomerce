import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { heroSlideReorderSchema } from "@/lib/server/hero-slides/schemas";
import { reorderHeroSlides } from "@/lib/server/hero-slides/service";
import { parseBody } from "@/lib/server/validation";

/** PUT /api/v1/hero-slides/reorder — `{ ids }`: every slide id in the new order. */
export const PUT = route(withAuth(async (request) => reorderHeroSlides((await parseBody(request, heroSlideReorderSchema)).ids), STAFF_ONLY));
