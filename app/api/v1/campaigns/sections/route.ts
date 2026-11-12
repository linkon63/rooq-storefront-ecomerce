import { route } from "@/lib/server/http";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { getCampaignSections } from "@/lib/server/campaigns/service";

/** GET /api/v1/campaigns/sections — admin: sections for the campaign form. */
export const GET = route(withAuth(() => getCampaignSections(), { roles: [ROLES.admin, ROLES.superadmin] }));
