import { created, route } from "@/lib/server/http";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, isStaffUser } from "@/lib/server/catalog/access";
import { productListQuery } from "@/lib/server/catalog/products/list-schema";
import { productCreateSchema } from "@/lib/server/catalog/products/schemas";
import { listProducts } from "@/lib/server/catalog/products/list";
import { createProduct } from "@/lib/server/catalog/products/service";

/** GET /api/v1/products — shop listing with filters, sort and facets (scope=admin for staff). */
export const GET = route(
  withAuth((request, { user }) => listProducts(parseQuery(request, productListQuery), { isStaff: isStaffUser(user) }), { public: true }),
);

/** POST /api/v1/products — create (admin). */
export const POST = route(
  withAuth(async (request) => created(await createProduct(await parseBody(request, productCreateSchema))), STAFF_ONLY),
);
