"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  IResetPasswordPayload,
  resetPasswordZodSchema,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const resetPasswordAction = async (
  payload: IResetPasswordPayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
  const parsedPayload = resetPasswordZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return { success: false, message: firstError };
  }

  try {
    const response = await httpClient.post<{
      accessToken?: string;
      refreshToken?: string;
      token?: string;
    }>("/auth/reset-password", parsedPayload.data);

    if (response.data?.accessToken) {
      await setTokenInCookies("accessToken", response.data.accessToken);
    }
    if (response.data?.refreshToken) {
      await setTokenInCookies("refreshToken", response.data.refreshToken);
    }
    if (response.data?.token) {
      await setTokenInCookies(
        "better-auth.session_token",
        response.data.token,
        24 * 60 * 60,
      );
    }

    redirect("/dashboard");
    return response;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Failed to reset password";
    return { success: false, message };
  }
};
