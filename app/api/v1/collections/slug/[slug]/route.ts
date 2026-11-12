import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { collectionDetailQuery } from "@/lib/server/catalog/collections/schemas";
import { getCollectionBySlug } from "@/lib/server/catalog/collections/service";

/** GET /api/v1/collections/slug/:slug — collection page: products by position (?page&limit&facets) + looks. */
export const GET = route<{ slug: string }>((request, { params }) =>
  getCollectionBySlug(decodeURIComponent(params.slug), parseQuery(request, collectionDetailQuery)),
);
