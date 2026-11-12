import { apiRequest } from "@/lib/api";
import type { Shopper, ShopperNotification } from "@/types/storefront/content";

/** Shopper auth and account endpoints (`/auth/*`, `/profile/*`, `/notifications`). */

type AuthUser = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
};

export type AuthResult = { accessToken: string; user: Shopper };

export function toShopper(user: AuthUser): Shopper {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatarUrl: user.avatarUrl ?? user.avatar ?? null,
  };
}

async function authCall(path: string, body: Record<string, unknown>): Promise<AuthResult> {
  const result = await apiRequest<{ accessToken: string; user: AuthUser }>(path, { method: "POST", body });
  return { accessToken: result.accessToken, user: toShopper(result.user) };
}

export function login(identifier: string, password: string, rememberMe: boolean): Promise<AuthResult> {
  const isEmail = identifier.includes("@");
  return authCall("/auth/login", {
    identifier,
    ...(isEmail ? { email: identifier } : {}),
    password,
    rememberMe,
  });
}

export function register(input: { name: string; email: string; phone: string; password: string }): Promise<AuthResult> {
  return authCall("/auth/register", input);
}

export function googleLogin(accessToken: string): Promise<AuthResult> {
  return authCall("/auth/google", { accessToken });
}

export function logout(): Promise<unknown> {
  return apiRequest("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<Shopper> {
  return toShopper(await apiRequest<AuthUser>("/auth/me"));
}

export async function updateMe(input: { name: string; email?: string; phone?: string }): Promise<Shopper> {
  return toShopper(await apiRequest<AuthUser>("/auth/me", { method: "PATCH", body: input }));
}

export function changePassword(input: { currentPassword: string; newPassword: string }): Promise<unknown> {
  return apiRequest("/auth/change-password", { method: "POST", body: input });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest("/auth/forgot-password", { method: "POST", body: { email } });
}

export function listNotifications(): Promise<ShopperNotification[]> {
  return apiRequest<ShopperNotification[]>("/notifications");
}

export function markNotificationRead(id: string): Promise<unknown> {
  return apiRequest(`/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
}

export function subscribeNewsletter(email: string): Promise<unknown> {
  return fetch("/api/resend/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((response) => {
    if (!response.ok) throw new Error(String(response.status));
    return response.json().catch(() => null);
  });
}
