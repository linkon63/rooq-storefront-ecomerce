import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { parseBody, parseQuery } from "@/lib/server/validation";
import { adminCreateReviewSchema, listReviewsQuery } from "@/lib/server/reviews/schemas";
import { createAdminReview, listReviews } from "@/lib/server/reviews/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** GET /api/v1/reviews — admin: every review, paginated (`?status&productId&rating&search`). */
export const GET = route(withAuth((request) => listReviews(parseQuery(request, listReviewsQuery)), staff));

/** POST /api/v1/reviews — admin: create a review on behalf of a user. */
export const POST = route(
  withAuth(
    async (request, { user }) => created(await createAdminReview(user, await parseBody(request, adminCreateReviewSchema))),
    staff,
  ),
);
