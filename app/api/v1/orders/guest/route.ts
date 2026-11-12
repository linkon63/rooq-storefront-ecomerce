import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { createGuestOrderSchema } from "@/lib/server/orders/schemas";
import { createGuestOrder } from "@/lib/server/orders/checkout";

/** POST /api/v1/orders/guest — public guest checkout. */
export const POST = route(async (request) => created(await createGuestOrder(await parseBody(request, createGuestOrderSchema))));
