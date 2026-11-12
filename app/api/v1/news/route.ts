import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { createNewsSchema } from "@/lib/server/news/schemas";
import { readNewsRequest } from "@/lib/server/news/request";
import { createNews, listPublishedNews } from "@/lib/server/news/service";

/** GET /api/v1/news — public: published articles. */
export const GET = route(() => listPublishedNews());

/** POST /api/v1/news — admin; multipart with an optional `image` cover, or JSON. */
export const POST = route(
  withAuth(
    async (request, { user }) => {
      const { input, file } = await readNewsRequest(request, createNewsSchema);
      return created(await createNews(input, { file, uploadedById: user.id }));
    },
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);
