import { created, ok, route } from "@/lib/server/http";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { variantMatrixSchema } from "@/lib/server/catalog/variants/schemas";
import { generateVariantMatrix } from "@/lib/server/catalog/variants/matrix";

/** POST /api/v1/products/:id/variants/generate — sizes × colours matrix (201 when anything was created). */
export const POST = route<{ id: string }>(
  withAuth<{ id: string }>(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const result = await generateVariantMatrix(id, await parseBody(request, variantMatrixSchema), user.id);
    if (result.dryRun) return ok({ planned: result.planned, skipped: result.skipped });
    const body = { created: result.created, skipped: result.skipped };
    return result.created.length ? created(body) : ok(body);
  }, STAFF_ONLY),
);
