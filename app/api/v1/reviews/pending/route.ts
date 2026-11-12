import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { parseQuery } from "@/lib/server/validation";
import { listReviewsQuery } from "@/lib/server/reviews/schemas";
import { listPendingReviews } from "@/lib/server/reviews/service";

/** GET /api/v1/reviews/pending — admin: the moderation queue, paginated. */
export const GET = route(
  withAuth((request) => listPendingReviews(parseQuery(request, listReviewsQuery)), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
