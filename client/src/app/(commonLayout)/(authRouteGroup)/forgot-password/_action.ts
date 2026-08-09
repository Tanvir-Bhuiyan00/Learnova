"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  IForgotPasswordPayload,
  forgotPasswordZodSchema,
} from "@/zod/auth.validation";

export const forgotPasswordAction = async (
  payload: IForgotPasswordPayload,
): Promise<ApiResponse<unknown> | ApiErrorResponse> => {
  const parsedPayload = forgotPasswordZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    const firstError = parsedPayload.error.issues[0].message || "Invalid input";
    return { success: false, message: firstError };
  }

  try {
    const response = await httpClient.post<unknown>(
      "/auth/forget-password",
      parsedPayload.data,
    );
    return response;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send reset email";
    return { success: false, message };
  }
};
