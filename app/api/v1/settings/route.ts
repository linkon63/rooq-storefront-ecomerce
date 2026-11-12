import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { isStaffRole } from "@/utils/roles";
import { updateSettingsSchema } from "@/lib/server/settings/schemas";
import * as settings from "@/lib/server/settings/service";

/** GET /api/v1/settings — public; the fraud-check API key is only shown to staff. */
export const GET = route(
  withAuth((_request, { user }) => settings.getSettings({ includeSecrets: isStaffRole(user?.role?.name) }), {
    public: true,
  }),
);

/** PATCH /api/v1/settings — create or update the store settings */
export const PATCH = route(
  withAuth(async (request) => settings.upsertSettings(await parseBody(request, updateSettingsSchema)), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
