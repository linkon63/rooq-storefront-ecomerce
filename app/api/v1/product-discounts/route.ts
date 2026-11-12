import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { createProductDiscountSchema, listProductDiscountsQuery } from "@/lib/server/product-discounts/schemas";
import { createProductDiscount, listProductDiscounts } from "@/lib/server/product-discounts/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** POST /api/v1/product-discounts — admin. */
export const POST = route(
  withAuth(async (request) => created(await createProductDiscount(await parseBody(request, createProductDiscountSchema))), staff),
);

/** GET /api/v1/product-discounts — admin, paginated (`?search&status`). */
export const GET = route(withAuth((request) => listProductDiscounts(parseQuery(request, listProductDiscountsQuery)), staff));
