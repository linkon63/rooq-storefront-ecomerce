import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { backInStockNotifySchema } from "@/lib/server/catalog/back-in-stock/schemas";
import { notifyVariant } from "@/lib/server/catalog/back-in-stock/service";

/** POST /api/v1/back-in-stock/notify — email pending requests for an in-stock variant → { notified }. */
export const POST = route(withAuth(async (request) => created(await notifyVariant((await parseBody(request, backInStockNotifySchema)).variantId)), STAFF_ONLY));
