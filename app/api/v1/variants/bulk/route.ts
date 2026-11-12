import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { variantBulkSchema } from "@/lib/server/catalog/variants/schemas";
import { bulkUpdateVariants } from "@/lib/server/catalog/variants/bulk";

/** PATCH /api/v1/variants/bulk — bulk price / stock / active edit in one transaction. */
export const PATCH = route(
  withAuth(async (request, { user }) => bulkUpdateVariants(await parseBody(request, variantBulkSchema), user.id), STAFF_ONLY),
);
