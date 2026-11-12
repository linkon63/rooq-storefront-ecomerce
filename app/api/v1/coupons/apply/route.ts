import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { applyCouponSchema } from "@/lib/server/coupons/schemas";
import { applyCoupon } from "@/lib/server/coupons/service";

/** POST /api/v1/coupons/apply — public quote: { code, subtotal } → { coupon, discount, total }. */
export const POST = route(async (request) => created(await applyCoupon(await parseBody(request, applyCouponSchema))));
