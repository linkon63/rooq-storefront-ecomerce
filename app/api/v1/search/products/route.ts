import { route } from "@/lib/server/http";
import { parseQuery } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { isStaffUser } from "@/lib/server/catalog/access";
import { productListQuery } from "@/lib/server/catalog/products/list-schema";
import { listProducts } from "@/lib/server/catalog/products/list";

/** GET /api/v1/search/products — same as GET /products. */
export const GET = route(
  withAuth((request, { user }) => listProducts(parseQuery(request, productListQuery), { isStaff: isStaffUser(user) }), { public: true }),
);
