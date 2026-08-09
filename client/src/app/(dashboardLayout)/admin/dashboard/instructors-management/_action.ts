"use server";

import {
  createInstructor,
  deleteInstructor,
  getInstructorById,
  updateInstructor,
} from "@/services/instructor.services";
import { type ApiErrorResponse, type ApiResponse } from "@/types/api.types";
import {
  type ICreateInstructorPayload,
  type IInstructor,
  type IInstructorDetails,
  type IUpdateInstructorPayload,
} from "@/types/instructor.types";
import {
  createInstructorServerZodSchema,
  updateInstructorServerZodSchema,
} from "@/zod/instructor.validation";

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

export const createInstructorAction = async (
  payload: ICreateInstructorPayload,
): Promise<ApiResponse<IInstructor> | ApiErrorResponse> => {
  const parsedPayload = createInstructorServerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    return await createInstructor(parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to create instructor"),
    };
  }
};

export const updateInstructorAction = async (
  id: string,
  payload: IUpdateInstructorPayload,
): Promise<ApiResponse<IInstructor> | ApiErrorResponse> => {
  const parsedPayload = updateInstructorServerZodSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return {
      success: false,
      message: parsedPayload.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    return await updateInstructor(id, parsedPayload.data);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to update instructor"),
    };
  }
};

export const deleteInstructorAction = async (
  id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid instructor id",
    };
  }

  try {
    return await deleteInstructor(id);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to delete instructor"),
    };
  }
};

export const getInstructorByIdAction = async (
  id: string,
): Promise<ApiResponse<IInstructorDetails> | ApiErrorResponse> => {
  if (!id) {
    return {
      success: false,
      message: "Invalid instructor id",
    };
  }

  try {
    return await getInstructorById(id);
  } catch (error: unknown) {
    return {
      success: false,
      message: getActionErrorMessage(error, "Failed to fetch instructor details"),
    };
  }
};
