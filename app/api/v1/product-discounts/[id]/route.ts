import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { updateProductDiscountSchema } from "@/lib/server/product-discounts/schemas";
import {
  deleteProductDiscount,
  getProductDiscount,
  updateProductDiscount,
} from "@/lib/server/product-discounts/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** GET /api/v1/product-discounts/:id — public (the shop's `?discount=` offer page). */
export const GET = route<{ id: string }>((_request, { params }) => getProductDiscount(parseParams(params, idParam).id));

/** PATCH /api/v1/product-discounts/:id — admin. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return updateProductDiscount(id, await parseBody(request, updateProductDiscountSchema));
  }, staff),
);

/** DELETE /api/v1/product-discounts/:id — admin. */
export const DELETE = route<{ id: string }>(
  withAuth((_request, { params }) => deleteProductDiscount(parseParams(params, idParam).id), staff),
);
