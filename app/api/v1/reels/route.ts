import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY, formFields } from "@/lib/server/catalog/access";
import { created, route } from "@/lib/server/http";
import { badRequest } from "@/lib/server/http-error";
import { readFormData } from "@/lib/server/media/upload";
import { reelCreateSchema } from "@/lib/server/reels/schemas";
import { createReel, listReels } from "@/lib/server/reels/service";
import { parseValue } from "@/lib/server/validation";

/** GET /api/v1/reels — every reel in order, active or not (admin). */
export const GET = route(withAuth(() => listReels(), STAFF_ONLY));

/** POST /api/v1/reels — multipart: an MP4 `video` file and `productId`. */
export const POST = route(
  withAuth(async (request) => {
    const form = await readFormData(request);
    const { productId } = parseValue(formFields(form), reelCreateSchema);
    const video = form.get("video");
    if (!video || typeof video === "string") throw badRequest(ERROR_MESSAGES.reel.videoRequired);
    return created(await createReel(video, productId));
  }, STAFF_ONLY),
);
