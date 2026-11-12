import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { updateCouponSchema } from "@/lib/server/coupons/schemas";
import * as coupons from "@/lib/server/coupons/service";

type Params = { id: string };
const staff = { roles: [ROLES.admin, ROLES.superadmin] };

/**
 * GET /api/v1/coupons/:code — public. Next needs one name for sibling dynamic
 * segments, so the old `:code` param arrives as `id` here.
 */
export const GET = route<Params>(async (_request, { params }) => coupons.getCouponByCode(decodeURIComponent(params.id)));

/** PATCH /api/v1/coupons/:id — admin. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return coupons.updateCoupon(id, await parseBody(request, updateCouponSchema));
  }, staff),
);

/** DELETE /api/v1/coupons/:id — admin. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params }) => coupons.deleteCoupon(parseParams(params, idParam).id), staff),
);
