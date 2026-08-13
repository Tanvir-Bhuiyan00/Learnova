"use server";

import {
  changeUserRole,
  changeUserStatus,
} from "@/services/admin.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import {
  IChangeUserRolePayload,
  IChangeUserStatusPayload,
} from "@/types/admin.types";

const getActionErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

export const changeUserStatusAction = async (
  payload: IChangeUserStatusPayload,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!payload.userId || !payload.userStatus) {
    return {
      success: false,
      message: "Invalid user id or status",
    };
  }

  try {
    return await changeUserStatus(payload);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to change user status"),
    };
  }
};

export const changeUserRoleAction = async (
  payload: IChangeUserRolePayload,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!payload.userId || !payload.role) {
    return {
      success: false,
      message: "Invalid user id or role",
    };
  }

  try {
    return await changeUserRole(payload);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to change user role"),
    };
  }
};
