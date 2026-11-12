import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { createPermissionSchema } from "@/lib/server/roles/schemas";
import * as roles from "@/lib/server/roles/service";

const superadmin = { roles: [ROLES.superadmin] } as const;

/** POST /api/v1/permissions */
export const POST = route(
  withAuth(async (request) => created(await roles.createPermission(await parseBody(request, createPermissionSchema))), superadmin),
);

/** GET /api/v1/permissions */
export const GET = route(withAuth(() => roles.listPermissions(), superadmin));
