import { created, route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { parseBody } from "@/lib/server/validation";
import { ROLES } from "@/lib/constants/auth";
import { createCouponSchema } from "@/lib/server/coupons/schemas";
import * as coupons from "@/lib/server/coupons/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] };

/** POST /api/v1/coupons — admin. */
export const POST = route(
  withAuth(async (request) => created(await coupons.createCoupon(await parseBody(request, createCouponSchema))), staff),
);

/** GET /api/v1/coupons — admin. */
export const GET = route(withAuth(() => coupons.listCoupons(), staff));
