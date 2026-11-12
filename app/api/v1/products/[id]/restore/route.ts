import { created, route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { restoreProduct } from "@/lib/server/catalog/products/service";

/** POST /api/v1/products/:id/restore — un-archive as a draft (admin). */
export const POST = route<{ id: string }>(
  withAuth<{ id: string }>(async (_request, { params }) => created(await restoreProduct(parseParams(params, idParam).id)), STAFF_ONLY),
);
