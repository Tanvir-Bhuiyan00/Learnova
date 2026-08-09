"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { cookies } from "next/headers";
import { UserInfo } from "@/types/user.types";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function fetchNewTokens(
  refreshToken: string,
  sessionToken?: string,
): Promise<{
  accessToken?: string;
  refreshToken?: string;
  token?: string;
} | null> {
  try {
    const cookieParts = [`refreshToken=${refreshToken}`];

    if (sessionToken) {
      cookieParts.push(`better-auth.session_token=${sessionToken}`);
    }

    const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieParts.join("; "),
      },
    });

    if (!res.ok) {
      return null;
    }

    const { data } = await res.json();

    return {
      accessToken: data?.accessToken,
      refreshToken: data?.refreshToken,
      token: data?.token,
    };
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export async function getNewTokensWithRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    const tokens = await fetchNewTokens(refreshToken, sessionToken);

    if (!tokens) {
      return false;
    }

    const { accessToken, refreshToken: newRefreshToken, token } = tokens;

    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }

    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken);
    }

    if (token) {
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
    }

    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

export async function getUserInfo() {
  try {
    const response = await httpClient.get<UserInfo>("/auth/me");
    if (!response.success) return null;
    return response.data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return { success: false, message: "Not authenticated" };
    }

    const res = await fetch(`${BASE_API_URL}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Failed to change password" };
  }
}
