import { route } from "@/lib/server/http";
import { getProductDetail } from "@/lib/server/catalog/products/detail";

/** GET /api/v1/products/slug/:slug — storefront product page. */
export const GET = route<{ slug: string }>((_request, { params }) => getProductDetail(decodeURIComponent(params.slug)));
