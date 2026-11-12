import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { idParam, parseBody, parseParams, parseQuery, parseValue } from "@/lib/server/validation";
import { imageFiles, readFormData } from "@/lib/server/media/upload";
import { createReviewSchema, productReviewsQuery } from "@/lib/server/reviews/schemas";
import { createReview, listProductReviews } from "@/lib/server/reviews/service";
import { formFields, isMultipart } from "@/utils/form-fields";

/** GET /api/v1/products/:id/reviews — public: approved reviews + rating/fit summary. */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const { id } = parseParams(params, idParam);
  return listProductReviews(id, parseQuery(request, productReviewsQuery));
});

/** POST /api/v1/products/:id/reviews — signed in; JSON, or multipart with up to 5 `photos`. */
export const POST = route<{ id: string }>(
  withAuth(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    if (isMultipart(request.headers.get("content-type"))) {
      const form = await readFormData(request);
      const input = parseValue(formFields(form, ["photos"]), createReviewSchema);
      return created(await createReview(user, id, input, imageFiles(form, "photos")));
    }
    return created(await createReview(user, id, await parseBody(request, createReviewSchema)));
  }),
);
