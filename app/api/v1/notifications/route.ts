import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { createNotificationSchema } from "@/lib/server/notifications/schemas";
import * as notifications from "@/lib/server/notifications/service";

/**
 * POST /api/v1/notifications — staff only. The old endpoint let any signed-in
 * customer post a notification to any other user.
 */
export const POST = route(
  withAuth(
    async (request) => created(await notifications.createNotification(await parseBody(request, createNotificationSchema))),
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);

/** GET /api/v1/notifications — the signed-in user's, newest first */
export const GET = route(withAuth((_request, { user }) => notifications.listNotifications(user.id)));
