import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { createRoleSchema } from "@/lib/server/roles/schemas";
import * as roles from "@/lib/server/roles/service";

const superadmin = { roles: [ROLES.superadmin] } as const;

/** POST /api/v1/roles */
export const POST = route(
  withAuth(async (request) => created(await roles.createRole(await parseBody(request, createRoleSchema))), superadmin),
);

/** GET /api/v1/roles — with permissions and (password-free) users */
export const GET = route(withAuth(() => roles.listRoles(), superadmin));
