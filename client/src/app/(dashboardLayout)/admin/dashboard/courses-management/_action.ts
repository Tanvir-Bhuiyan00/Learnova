"use server";

import {
  createCourse,
  deleteCourse,
  updateCourse,
} from "@/services/course.services";
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

export const createCourseAction = async (payload: {
  title: string;
  description?: string;
  price?: number;
  level?: string;
  language?: string;
  categoryId?: string;
  instructorId?: string;
}): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  try {
    return await createCourse({
      title: payload.title,
      description: payload.description || undefined,
      price: payload.price ?? 0,
      level: (payload.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS") ?? "BEGINNER",
      language: payload.language || "English",
      categoryId: payload.categoryId ?? "",
      instructorId: payload.instructorId || undefined,
    });
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to create course") };
  }
};

export const updateCourseAction = async (
  id: string,
  payload: {
    title?: string;
    description?: string;
    price?: number;
    level?: string;
    language?: string;
    categoryId?: string;
    instructorId?: string;
    status?: string;
  },
): Promise<ApiResponse<{ message: string }> | ApiErrorResponse> => {
  if (!id) return { success: false, message: "Invalid id" };
  try {
    return await updateCourse(id, {
      title: payload.title || undefined,
      description: payload.description || undefined,
      price: payload.price,
      level: payload.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS" | undefined,
      language: payload.language || undefined,
      categoryId: payload.categoryId || undefined,
      instructorId: payload.instructorId || undefined,
      status: payload.status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined,
    });
  } catch (error) {
    return { success: false, message: getActionErrorMessage(error, "Failed to update course") };
  }
};
