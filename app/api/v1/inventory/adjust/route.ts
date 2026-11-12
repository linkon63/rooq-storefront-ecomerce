import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { inventoryAdjustSchema } from "@/lib/server/catalog/inventory/schemas";
import { adjustInventory } from "@/lib/server/catalog/inventory/service";

/** POST /api/v1/inventory/adjust — { variantId, change | setTo, type?, reason? } → { variant, movement }. */
export const POST = route(
  withAuth(async (request, { user }) => created(await adjustInventory(await parseBody(request, inventoryAdjustSchema), user.id)), STAFF_ONLY),
);
