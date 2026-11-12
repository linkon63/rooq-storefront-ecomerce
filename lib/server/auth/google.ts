import "server-only";
import { GOOGLE_USERINFO_URL } from "@/lib/constants/auth";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";
import { serviceUnavailable, unauthorized } from "../http-error";

export type GoogleProfile = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

/** Verifies a client-side Google access token by asking Google who it belongs to. */
export async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  let response: Response;
  try {
    response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    throw serviceUnavailable(ERROR_MESSAGES.auth.googleUnreachable);
  }
  if (!response.ok) throw unauthorized(ERROR_MESSAGES.auth.googleTokenInvalid);
  return (await response.json()) as GoogleProfile;
}
