import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import * as notifications from "@/lib/server/notifications/service";

/** PATCH /api/v1/notifications/read-all → { count } */
export const PATCH = route(withAuth((_request, { user }) => notifications.markAllRead(user.id)));
