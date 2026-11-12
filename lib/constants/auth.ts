/** Role names the API guards match on (Role.name). */
export const ROLES = {
  superadmin: "superadmin",
  admin: "admin",
  customer: "user",
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** Roles allowed into the admin panel. */
export const STAFF_ROLES: readonly string[] = [ROLES.superadmin, ROLES.admin];

/** httpOnly cookie the API sets on login/register (same as the old backend). */
export const AUTH_COOKIE = "access_token";
/** Client-readable cookies the UI sets itself and sends back as a Bearer token. */
export const ADMIN_TOKEN_COOKIE = "admin_access_token";
export const CUSTOMER_TOKEN_COOKIE = "customer_access_token";

/** "Remember me" cookie lifetime (7 days), in seconds. */
export const REMEMBER_ME_MAX_AGE = 7 * 24 * 60 * 60;
export const DEFAULT_JWT_EXPIRES_IN = "7d";
export const BCRYPT_ROUNDS = 10;
export const PASSWORD_MIN_LENGTH = 6;
/** Password reset token lifetime, in milliseconds (1 hour). */
export const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
export const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

/**
 * Admin-panel sections a role can be granted (Permission.name). Keep in sync
 * with the admin sidebar.
 */
export const ADMIN_SECTION_KEYS = [
  "dashboard",
  "products",
  "stock",
  "sales",
  "orders",
  "returns",
  "reports",
  "reviews",
  "content",
  "settings",
] as const;
