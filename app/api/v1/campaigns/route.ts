import { route, created } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { isStaffRole } from "@/utils/roles";
import { createCampaignSchema } from "@/lib/server/campaigns/schemas";
import { readCampaignRequest } from "@/lib/server/campaigns/request";
import { createCampaign, listCampaigns } from "@/lib/server/campaigns/service";

/** POST /api/v1/campaigns — admin; multipart with up to 10 `images`, or JSON with `keepImages` URLs. */
export const POST = route(
  withAuth(
    async (request, { user }) => {
      const { input, files } = await readCampaignRequest(request, createCampaignSchema);
      return created(await createCampaign(input, files, user.id));
    },
    { roles: [ROLES.admin, ROLES.superadmin] },
  ),
);

/** GET /api/v1/campaigns — public: live campaigns; staff tokens see every campaign. */
export const GET = route(
  withAuth((_request, { user }) => listCampaigns({ includeAll: isStaffRole(user?.role?.name) }), { public: true }),
);
