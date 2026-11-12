import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { listAllNews } from "@/lib/server/news/service";

/** GET /api/v1/news/manage — admin: every article including drafts. */
export const GET = route(withAuth(() => listAllNews(), { roles: [ROLES.admin, ROLES.superadmin] }));
