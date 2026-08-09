"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  IVerifyEmailPayload,
  verifyEmailZodSchema,
} from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const verifyEmailAction = async (
  payload: IVerifyEmailPayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
  const parsedPayload = verifyEmailZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return { success: false, message: firstError };
  }

  try {
    const response = await httpClient.post<unknown>(
      "/auth/verify-email",
      parsedPayload.data,
    );

    redirect("/login?verified=true");
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
      error instanceof Error ? error.message : "Email verification failed";
    return { success: false, message };
  }
};
