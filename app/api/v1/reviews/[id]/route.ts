import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { updateReviewSchema } from "@/lib/server/reviews/schemas";
import { deleteReview, updateReview } from "@/lib/server/reviews/service";

/** PATCH /api/v1/reviews/:id — the author edits; staff may also approve/reject. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    return updateReview(user, id, await parseBody(request, updateReviewSchema));
  }),
);

/** DELETE /api/v1/reviews/:id — the author or staff. */
export const DELETE = route<{ id: string }>(
  withAuth(async (_request, { params, user }) => deleteReview(user, parseParams(params, idParam).id)),
);
