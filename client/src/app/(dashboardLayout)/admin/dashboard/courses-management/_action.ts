"use server";

import { deleteCourse } from "@/services/course.services";
import { ApiErrorResponse, ApiResponse } from "@/types/api.types";
import { getActionErrorMessage } from "../_utils";

export const deleteCourseAction = async (
  id: string,
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!id) return { success: false, message: "Invalid id" };
  try {
    return await deleteCourse(id);
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to delete course") };
  }
};
