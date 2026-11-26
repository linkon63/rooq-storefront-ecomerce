import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { listHeroMobileProducts, setHeroMobileProducts } from "@/lib/server/hero-slides/mobile-service";
import { heroMobileSchema } from "@/lib/server/hero-slides/schemas";
import { parseBody } from "@/lib/server/validation";

/** GET /api/v1/hero-slides/mobile — the products the phone hero cycles through (admin). */
export const GET = route(withAuth(() => listHeroMobileProducts(), STAFF_ONLY));

/** PUT /api/v1/hero-slides/mobile — `{ items: [{ productId, mediaId | null }] }`, replaces the list. */
export const PUT = route(
  withAuth(async (request) => setHeroMobileProducts((await parseBody(request, heroMobileSchema)).items), STAFF_ONLY),
);
