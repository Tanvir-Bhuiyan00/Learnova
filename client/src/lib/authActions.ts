"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const baseApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if ((sessionToken || refreshToken) && baseApiUrl) {
    const baseUrl = baseApiUrl.replace(/\/api\/v1\/?$/, "");

    try {
      await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Cookie: `better-auth.session_token=${sessionToken ?? ""}`,
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
