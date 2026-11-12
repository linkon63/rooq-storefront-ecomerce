import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { webhookPayloadSchema } from "@/lib/server/payments/schemas";
import { acknowledgeWebhook } from "@/lib/server/payments/service";

/** POST /api/v1/payments/webhook — public provider callback (placeholder). */
export const POST = route(async (request) => created(acknowledgeWebhook(await parseBody(request, webhookPayloadSchema))));
