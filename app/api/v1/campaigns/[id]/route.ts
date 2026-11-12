import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { isStaffRole } from "@/utils/roles";
import { idParam, parseParams } from "@/lib/server/validation";
import { updateCampaignSchema } from "@/lib/server/campaigns/schemas";
import { readCampaignRequest } from "@/lib/server/campaigns/request";
import { deleteCampaign, getCampaign, updateCampaign } from "@/lib/server/campaigns/service";

const staff = { roles: [ROLES.admin, ROLES.superadmin] } as const;

/** GET /api/v1/campaigns/:id — public when live; staff see any campaign. */
export const GET = route<{ id: string }>(
  withAuth(
    (_request, { params, user }) =>
      getCampaign(parseParams(params, idParam).id, { includeAll: isStaffRole(user?.role?.name) }),
    { public: true },
  ),
);

/** PATCH /api/v1/campaigns/:id — admin; `keepImages` (JSON array of URLs) + new `images` replace the gallery. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params, user }) => {
    const { id } = parseParams(params, idParam);
    const { input, files } = await readCampaignRequest(request, updateCampaignSchema);
    return updateCampaign(id, input, files, user.id);
  }, staff),
);

/** DELETE /api/v1/campaigns/:id — admin. */
export const DELETE = route<{ id: string }>(
  withAuth((_request, { params }) => deleteCampaign(parseParams(params, idParam).id), staff),
);
