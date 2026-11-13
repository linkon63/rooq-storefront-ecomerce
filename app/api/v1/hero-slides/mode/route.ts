import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { heroModeSchema } from "@/lib/server/hero-slides/schemas";
import { getHeroMode, setHeroMode } from "@/lib/server/hero-slides/service";
import { parseBody } from "@/lib/server/validation";

/** GET /api/v1/hero-slides/mode — what the home hero shows: SLIDER or CAMPAIGN. */
export const GET = route(async () => ({ mode: await getHeroMode() }));

/** PUT /api/v1/hero-slides/mode — `{ mode }`. */
export const PUT = route(withAuth(async (request) => setHeroMode((await parseBody(request, heroModeSchema)).mode), STAFF_ONLY));
