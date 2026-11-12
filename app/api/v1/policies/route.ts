import { route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { updatePoliciesSchema } from "@/lib/server/policies/schemas";
import * as policies from "@/lib/server/policies/service";

/** GET /api/v1/policies — public, `{ delivery: { title, content }, … }` or null */
export const GET = route(() => policies.getPolicies());

/** PATCH /api/v1/policies */
export const PATCH = route(
  withAuth(async (request) => policies.upsertPolicies(await parseBody(request, updatePoliciesSchema)), {
    roles: [ROLES.admin, ROLES.superadmin],
  }),
);
