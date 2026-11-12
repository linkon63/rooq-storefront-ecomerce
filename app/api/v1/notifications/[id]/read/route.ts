import { route } from "@/lib/server/http";
import { idParam, parseParams } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import * as notifications from "@/lib/server/notifications/service";

/** PATCH /api/v1/notifications/:id/read */
export const PATCH = route<{ id: string }>(
  withAuth((_request, { params, user }) => notifications.markRead(user.id, parseParams(params, idParam).id)),
);
