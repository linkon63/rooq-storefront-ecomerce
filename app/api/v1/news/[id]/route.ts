import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { isStaffRole } from "@/utils/roles";
import { idParam, parseParams } from "@/lib/server/validation";
import { updateNewsSchema } from "@/lib/server/news/schemas";
import { readNewsRequest } from "@/lib/server/news/request";
import { deleteNews, getNews, updateNews } from "@/lib/server/news/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** GET /api/v1/news/:id — public for published articles; drafts only for staff. */
export const GET = route<{ id: string }>(
  withAuth(
    (_request, { params, user }) => getNews(parseParams(params, idParam).id, { includeDrafts: isStaffRole(user?.role?.name) }),
    { public: true },
  ),
);

/** PATCH /api/v1/news/:id — admin; `image` replaces the cover, `coverImageUrl=""` removes it. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const { input, file } = await readNewsRequest(request, updateNewsSchema);
    return updateNews(id, input, { file, uploadedById: user.id });
  }, staff),
);

/** DELETE /api/v1/news/:id — admin. */
export const DELETE = route<{ id: string }>(
  withAuth((_request, { params }) => deleteNews(parseParams(params, idParam).id), staff),
);
