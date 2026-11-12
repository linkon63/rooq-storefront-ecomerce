import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { idParam, parseBody, parseParams } from "@/lib/server/validation";
import { campaignStatusSchema } from "@/lib/server/campaigns/schemas";
import { changeCampaignStatus } from "@/lib/server/campaigns/service";

/** PATCH /api/v1/campaigns/:id/status — admin: active / inactive. */
export const PATCH = route<{ id: string }>(
  withAuth(async (request, { params }) => {
    const { id } = parseParams(params, idParam);
    return changeCampaignStatus(id, await parseBody(request, campaignStatusSchema));
  }, { roles: [ROLES.admin, ROLES.superadmin] }),
);
