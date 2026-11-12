import { route } from "@/lib/server/http";
import { getPublishedNewsBySlug } from "@/lib/server/news/service";

/** GET /api/v1/news/slug/:slug — public: one published article. */
export const GET = route<{ slug: string }>((_request, { params }) => getPublishedNewsBySlug(params.slug));
