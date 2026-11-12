import "server-only";
import type { NextRequest } from "next/server";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { hasRequiredRole } from "@/utils/roles";
import { forbidden, unauthorized } from "../http-error";
import type { Handler, HandlerContext, HandlerResult, RouteParams } from "../http";
import { getCurrentUser, type CurrentUser } from "./current-user";

/** 401 unless the request carries a valid token for an active user. */
export async function requireAuth(request: NextRequest): Promise<CurrentUser> {
  const user = await getCurrentUser(request);
  if (!user) throw unauthorized(ERROR_MESSAGES.auth.unauthorized);
  return user;
}

/** RolesGuard: superadmin passes everything; otherwise role name must match. */
export function assertRoles(user: CurrentUser, roles: readonly string[]): void {
  if (!hasRequiredRole(user.role?.name, roles)) throw forbidden(ERROR_MESSAGES.auth.insufficientRole);
}

/** requireAuth + assertRoles. */
export async function requireRoles(request: NextRequest, ...roles: string[]): Promise<CurrentUser> {
  const user = await requireAuth(request);
  assertRoles(user, roles);
  return user;
}

type AuthedHandler<P extends RouteParams> = (
  request: NextRequest,
  context: HandlerContext<P> & { user: CurrentUser },
) => Promise<HandlerResult> | HandlerResult;

type OptionalAuthHandler<P extends RouteParams> = (
  request: NextRequest,
  context: HandlerContext<P> & { user: CurrentUser | null },
) => Promise<HandlerResult> | HandlerResult;

export type WithAuthOptions = { roles?: readonly string[]; public?: false };
export type WithPublicOptions = { public: true };

/**
 * The old global JwtAuthGuard + @Roles(), as a handler decorator. Compose
 * inside route():
 *
 *   export const GET = route(withAuth(async (req, { user }) => …));                 // signed in
 *   export const POST = route(withAuth(handler, { roles: [ROLES.admin] }));          // @Roles('admin')
 *   export const GET = route(withAuth(async (req, { user }) => …, { public: true })); // @Public, user may be null
 *
 * Route handlers are public by default in Next — any route that was not
 * @Public() in the old backend MUST be wrapped.
 */
export function withAuth<P extends RouteParams = RouteParams>(
  handler: OptionalAuthHandler<P>,
  options: WithPublicOptions,
): Handler<P>;
export function withAuth<P extends RouteParams = RouteParams>(
  handler: AuthedHandler<P>,
  options?: WithAuthOptions,
): Handler<P>;
export function withAuth<P extends RouteParams = RouteParams>(
  handler: AuthedHandler<P> | OptionalAuthHandler<P>,
  options: WithAuthOptions | WithPublicOptions = {},
): Handler<P> {
  return async (request, context) => {
    if (options.public) {
      const user = await getCurrentUser(request);
      return (handler as OptionalAuthHandler<P>)(request, { ...context, user });
    }
    const user = await requireAuth(request);
    if (options.roles?.length) assertRoles(user, options.roles);
    return (handler as AuthedHandler<P>)(request, { ...context, user });
  };
}
