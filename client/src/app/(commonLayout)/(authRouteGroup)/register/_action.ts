"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { IRegisterPayload, registerZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const registerAction = async (
  payload: IRegisterPayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
  const parsedPayload = registerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return { success: false, message: firstError };
  }

  try {
    const response = await httpClient.post<unknown>(
      "/auth/register",
      parsedPayload.data,
    );

    redirect(`/login?registered=true`);
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
      error instanceof Error ? error.message : "Registration failed";
    return { success: false, message };
  }
};
