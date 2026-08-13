"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const baseApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if ((sessionToken || refreshToken) && baseApiUrl) {
    const baseUrl = baseApiUrl.replace(/\/api\/v1\/?$/, "");

    // Forward the real visitor IP so the API's rate limiter keys per user
    // instead of bucketing all server-side traffic under the client's IP.
    let internalHeaders: Record<string, string> = {};
    try {
      const requestHeaders = await headers();
      const forwardedFor = requestHeaders.get("x-forwarded-for");
      const lastIp = forwardedFor?.split(",").pop()?.trim();
      const internalSecret = process.env.JWT_ACCESS_SECRET;
      if (lastIp && internalSecret) {
        internalHeaders = {
          "X-Client-IP": lastIp,
          "X-Internal-Secret": internalSecret,
        };
      }
    } catch {
      // Headers unavailable — the API falls back to req.ip.
    }

    try {
      await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Cookie: `better-auth.session_token=${sessionToken ?? ""}`,
          ...internalHeaders,
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("better-auth.session_token");

  redirect("/login");
}
