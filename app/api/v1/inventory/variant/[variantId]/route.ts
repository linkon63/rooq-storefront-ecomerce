import { z } from "zod";
import { route } from "@/lib/server/http";
import { parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { getVariantInventory } from "@/lib/server/catalog/inventory/service";

type Params = { variantId: string };
const params = z.strictObject({ variantId: z.uuid({ error: ERROR_MESSAGES.common.invalidId }) });

/** GET /api/v1/inventory/variant/:variantId — the row plus its last 20 movements. */
export const GET = route<Params>(withAuth<Params>((_request, ctx) => getVariantInventory(parseParams(ctx.params, params).variantId), STAFF_ONLY));
