import { route } from "@/lib/server/http";
import { idParam, parseBody, parseParams, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, isStaffUser } from "@/lib/server/catalog/access";
import { productDetailQuery, productUpdateSchema } from "@/lib/server/catalog/products/schemas";
import { getProductById } from "@/lib/server/catalog/products/detail";
import { archiveProduct, updateProduct } from "@/lib/server/catalog/products/service";

type Params = { id: string };

/** GET /api/v1/products/:id — staff get the admin view (all variants, ids); `includeArchived=true` for archived. */
export const GET = route<Params>(
  withAuth<Params>(
    (request, { params, user }) => {
      const { id } = parseParams(params, idParam);
      const admin = isStaffUser(user);
      const query = parseQuery(request, productDetailQuery);
      return getProductById(id, { admin, includeArchived: admin && query.includeArchived });
    },
    { public: true },
  ),
);

export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return updateProduct(id, await parseBody(request, productUpdateSchema));
  }, STAFF_ONLY),
);

/** DELETE /api/v1/products/:id — archive (soft delete). */
export const DELETE = route<Params>(withAuth<Params>((_request, { params }) => archiveProduct(parseParams(params, idParam).id), STAFF_ONLY));
