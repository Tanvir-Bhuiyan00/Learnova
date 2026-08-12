import { NextResponse } from "next/server";
import {
  getNewTokensWithRefreshToken,
  getUserInfo,
} from "@/services/auth.services";
import { isTokenExpiringSoon } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

// Always resolve the user from the request's httpOnly cookies; never cache.
export const dynamic = "force-dynamic";

/**
 * Same-origin endpoint used by the public header to read the logged-in user
 * without exposing httpOnly tokens to client JS. The (commonLayout) server
 * layout no longer calls cookies(), which lets public pages be statically
 * rendered (ISR) instead of being forced dynamic.
 *
 * Public pages are no longer covered by the auth proxy, so refresh an expiring
 * access token here (route handlers may set cookies) before resolving the user.
 */
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (accessToken && refreshToken && (await isTokenExpiringSoon(accessToken))) {
    await getNewTokensWithRefreshToken(refreshToken);
  }

  const user = await getUserInfo();
  const response = NextResponse.json({ user });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
