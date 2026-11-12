import { route } from "@/lib/server/http";
import { searchSuggestions } from "@/lib/server/catalog/search/service";

/** GET /api/v1/search/suggestions?q= — up to 10 { id, name, slug, imageUrl }. */
export const GET = route((request) => searchSuggestions(request.nextUrl.searchParams.get("q") ?? undefined));
