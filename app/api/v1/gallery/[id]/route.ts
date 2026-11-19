import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { STAFF_ONLY } from "@/lib/server/catalog/access";
import { galleryStatusSchema } from "@/lib/server/gallery/schemas";
import { deleteGalleryEntry, setGalleryStatus } from "@/lib/server/gallery/service";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";

type Params = { id: string };

/** PATCH /api/v1/gallery/:id — staff: approve, reject or move back to pending. */
export const PATCH = route<Params>(
  withAuth<Params>(async (request, { params }) => {
    const { status } = await parseBody(request, galleryStatusSchema);
    return setGalleryStatus(parseParams(params, idParam).id, status);
  }, STAFF_ONLY),
);

/** DELETE /api/v1/gallery/:id — staff. */
export const DELETE = route<Params>(
  withAuth<Params>((_request, { params }) => deleteGalleryEntry(parseParams(params, idParam).id), STAFF_ONLY),
);
