import { created, route } from "@/lib/server/http";
import { parseBody } from "@/lib/server/validation";
import { withAuth } from "@/lib/server/auth/guard";
import { ROLES } from "@/lib/constants/auth";
import { createUserSchema } from "@/lib/server/users/schemas";
import * as users from "@/lib/server/users/service";

// Staff management — superadmin only (customers self-register via /auth/register).
const superadmin = { roles: [ROLES.superadmin] } as const;

/** POST /api/v1/users */
export const POST = route(
  withAuth(async (request) => created(await users.createUser(await parseBody(request, createUserSchema))), superadmin),
);

/** GET /api/v1/users */
export const GET = route(withAuth(() => users.listUsers(), superadmin));
