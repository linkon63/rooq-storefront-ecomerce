import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_TOKEN_COOKIE } from "@/lib/constants/auth";
import { isTokenValid } from "@/lib/proxy/verify-token";

const LOGIN_PATH = "/admin/login";

/** Guards /admin/*: no valid admin_access_token → login; signed in → skip login. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = await isTokenValid(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value);

  if (pathname === LOGIN_PATH) {
    return hasSession ? NextResponse.redirect(new URL("/admin/dashboard", request.url)) : NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    // Drop an expired/forged token so the login page does not bounce back.
    response.cookies.set(ADMIN_TOKEN_COOKIE, "", { path: "/admin", maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
