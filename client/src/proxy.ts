import { NextRequest, NextResponse } from "next/server";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "./lib/authUtils";

import { isTokenExpired, isTokenExpiringSoon } from "./lib/tokenUtils";
import {
  fetchNewTokens,
  getUserInfo,
} from "./services/auth.services";
import { jwtUtils } from "./lib/jwtUtils";

function setCookieOnResponse(
  response: NextResponse,
  name: string,
  value: string,
  maxAgeInSeconds: number,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeInSeconds,
  });
}

function maxAgeFromToken(token: string): number {
  const decoded = jwtUtils.decodedToken(token);
  if (decoded?.exp) {
    return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
  }
  return 0;
}

function updateCookieHeader(
  cookieHeader: string | null,
  name: string,
  value: string,
): string {
  const cookies = (cookieHeader ?? "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  const otherCookies = cookies.filter(
    (cookie) => cookie.split("=")[0] !== name,
  );

  return [...otherCookies, `${name}=${value}`].join("; ");
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl; // eg /dashboard, /admin/dashboard, /instructor/dashboard
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const decodedAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
        .data;

    const isValidAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
        .success;

    let userRole: UserRole | null = null;

    if (decodedAccessToken) {
      userRole = decodedAccessToken.role as UserRole;
    }

    const routerOwner = getRouteOwner(pathname);

    const unifySuperAdminAndAdminRole =
      userRole === "SUPER_ADMIN" ? "ADMIN" : userRole;

    userRole = unifySuperAdminAndAdminRole;

    const isAuth = isAuthRoute(pathname);

    //refresh token when it is expired or about to expire, then persist the new
    //tokens on the response so subsequent requests carry them
    if (
      accessToken &&
      refreshToken &&
      ((await isTokenExpired(accessToken)) ||
        (await isTokenExpiringSoon(accessToken)))
    ) {
      const sessionToken = request.cookies.get(
        "better-auth.session_token",
      )?.value;
      const refreshedTokens = await fetchNewTokens(refreshToken, sessionToken);

      if (refreshedTokens) {
        const newRequestHeaders = new Headers(request.headers);

        if (refreshedTokens.accessToken) {
          newRequestHeaders.set(
            "Cookie",
            updateCookieHeader(
              newRequestHeaders.get("Cookie"),
              "accessToken",
              refreshedTokens.accessToken,
            ),
          );
        }

        if (refreshedTokens.refreshToken) {
          newRequestHeaders.set(
            "Cookie",
            updateCookieHeader(
              newRequestHeaders.get("Cookie"),
              "refreshToken",
              refreshedTokens.refreshToken,
            ),
          );
        }

        if (refreshedTokens.token) {
          newRequestHeaders.set(
            "Cookie",
            updateCookieHeader(
              newRequestHeaders.get("Cookie"),
              "better-auth.session_token",
              refreshedTokens.token,
            ),
          );
        }

        newRequestHeaders.set("x-token-refreshed", "1");

        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        if (refreshedTokens.accessToken) {
          setCookieOnResponse(
            response,
            "accessToken",
            refreshedTokens.accessToken,
            maxAgeFromToken(refreshedTokens.accessToken),
          );
        }

        if (refreshedTokens.refreshToken) {
          setCookieOnResponse(
            response,
            "refreshToken",
            refreshedTokens.refreshToken,
            maxAgeFromToken(refreshedTokens.refreshToken),
          );
        }

        if (refreshedTokens.token) {
          setCookieOnResponse(
            response,
            "better-auth.session_token",
            refreshedTokens.token,
            24 * 60 * 60,
          );
        }

        return response;
      }
    }

    // Rule - 1 : User is logged in (has access token) and trying to access auth route -> redirect to dashboard.
    // /verify-email and /reset-password are exempt: they are required to clear
    // the emailVerified / needPasswordChange enforcement flags below.
    const isEnforcedAuthRoute =
      isAuth &&
      pathname !== "/verify-email" &&
      pathname !== "/reset-password";

    if (isEnforcedAuthRoute && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }

    // Rule - 2 : User is trying to access reset password page
    if (pathname === "/reset-password") {
      const email = request.nextUrl.searchParams.get("email");

      // case - 1 user has needPasswordChange true
      //no need for case 1 if need password change is handled from change-password page
      if (accessToken && email) {
        const userInfo = await getUserInfo();

        if (userInfo?.needPasswordChange) {
          return NextResponse.next();
        } else {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }

      // Case-2 user coming from forgot password

      if (email) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rule - 2b : User has a valid token and is on the verify-email page.
    // Verified users are bounced to their dashboard; unverified users stay.
    if (
      pathname === "/verify-email" &&
      accessToken &&
      isValidAccessToken
    ) {
      const userInfo = await getUserInfo();

      if (userInfo?.emailVerified) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
        );
      }

      return NextResponse.next();
    }

    // Rule-3 User trying to access Public route -> allow
    if (routerOwner === null) {
      return NextResponse.next();
    }

    // Rule - 4 User is Not logged in but trying to access protected route -> redirect to login
    if (!accessToken || !isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    //Rule - Enforcing user to stay in reset password or verify email page if their needPasswordChange or isEmailVerified flags are not satisfied respectively

    if (accessToken) {
      const userInfo = await getUserInfo();

      if (userInfo) {
        // need email verification scenario
        if (userInfo.emailVerified === false) {
          if (pathname !== "/verify-email") {
            const verifyEmailUrl = new URL("/verify-email", request.url);
            verifyEmailUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(verifyEmailUrl);
          }

          return NextResponse.next();
        }

        if (userInfo.emailVerified && pathname === "/verify-email") {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }

        // need password change scenario
        if (userInfo.needPasswordChange) {
          if (pathname !== "/reset-password") {
            const resetPasswordUrl = new URL("/reset-password", request.url);
            resetPasswordUrl.searchParams.set("email", userInfo.email);
            return NextResponse.redirect(resetPasswordUrl);
          }

          return NextResponse.next();
        }

        if (!userInfo.needPasswordChange && pathname === "/reset-password") {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }
    }

    // Rule - 5 User trying to access Common protected route -> allow
    if (routerOwner === "COMMON") {
      return NextResponse.next();
    }

    //Rule-6 User trying to visit role based protected but doesn't have required role -> redirect to their default dashboard

    if (
      routerOwner === "ADMIN" ||
      routerOwner === "INSTRUCTOR" ||
      routerOwner === "STUDENT"
    ) {
      if (routerOwner !== userRole) {
        return NextResponse.redirect(
          new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
        );
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in proxy middleware:", error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
