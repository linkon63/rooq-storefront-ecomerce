import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import * as notifications from "@/lib/server/notifications/service";

/** DELETE /api/v1/notifications/:id */
export const DELETE = route<{ id: string }>(
  withAuth((_request, { params, user }) => notifications.removeNotification(user.id, parseParams(params, idParam).id)),
);
