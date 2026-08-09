"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICourse,
  ICreateCoursePayload,
  IUpdateCoursePayload,
  IModule,
  ICreateModulePayload,
  IUpdateModulePayload,
  ILesson,
  ICreateLessonPayload,
  IUpdateLessonPayload,
  ILessonProgress,
} from "@/types/course.types";

export const getCourses = async (queryString?: string) => {
  try {
    const courses = await httpClient.get<ICourse[]>(
      `/courses${queryString ? `?${queryString}` : ""}`,
    );
    return courses;
  } catch (error) {
    console.log("Error fetching courses:", error);
    throw error;
  }
};

export const getCourseById = async (id: string) => {
  try {
    const course = await httpClient.get<ICourse>(`/courses/${id}`);
    return course;
  } catch (error) {
    console.log("Error fetching course details:", error);
    throw error;
  }
};

export const createCourse = async (payload: ICreateCoursePayload) => {
  try {
    const course = await httpClient.post<ICourse>("/courses", payload);
    return course;
  } catch (error) {
    console.log("Error creating course:", error);
    throw error;
  }
};

export const updateCourse = async (id: string, payload: IUpdateCoursePayload) => {
  try {
    const course = await httpClient.patch<ICourse>(`/courses/${id}`, payload);
    return course;
  } catch (error) {
    console.log("Error updating course:", error);
    throw error;
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/courses/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting course:", error);
    throw error;
  }
};

export const getModulesByCourse = async (courseId: string) => {
  try {
    const modules = await httpClient.get<IModule[]>(`/courses/${courseId}/modules`);
    return modules;
  } catch (error) {
    console.log("Error fetching modules:", error);
    throw error;
  }
};

export const createModule = async (courseId: string, payload: ICreateModulePayload) => {
  try {
    const module_ = await httpClient.post<IModule>(
      `/courses/${courseId}/modules`,
      payload,
    );
    return module_;
  } catch (error) {
    console.log("Error creating module:", error);
    throw error;
  }
};

export const updateModule = async (
  courseId: string,
  moduleId: string,
  payload: IUpdateModulePayload,
) => {
  try {
    const module_ = await httpClient.patch<IModule>(
      `/courses/${courseId}/modules/${moduleId}`,
      payload,
    );
    return module_;
  } catch (error) {
    console.log("Error updating module:", error);
    throw error;
  }
};

export const deleteModule = async (courseId: string, moduleId: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/courses/${courseId}/modules/${moduleId}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting module:", error);
    throw error;
  }
};

export const getLessonsByModule = async (courseId: string, moduleId: string) => {
  try {
    const lessons = await httpClient.get<ILesson[]>(
      `/courses/${courseId}/modules/${moduleId}/lessons`,
    );
    return lessons;
  } catch (error) {
    console.log("Error fetching lessons:", error);
    throw error;
  }
};

export const createLesson = async (
  courseId: string,
  moduleId: string,
  payload: ICreateLessonPayload,
) => {
  try {
    const lesson = await httpClient.post<ILesson>(
      `/courses/${courseId}/modules/${moduleId}/lessons`,
      payload,
    );
    return lesson;
  } catch (error) {
    console.log("Error creating lesson:", error);
    throw error;
  }
};

export const updateLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
  payload: IUpdateLessonPayload,
) => {
  try {
    const lesson = await httpClient.patch<ILesson>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
      payload,
    );
    return lesson;
  } catch (error) {
    console.log("Error updating lesson:", error);
    throw error;
  }
};

export const deleteLesson = async (
  courseId: string,
  moduleId: string,
  lessonId: string,
) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting lesson:", error);
    throw error;
  }
};

export const getMyLessonProgress = async (courseId: string) => {
  try {
    const progress = await httpClient.get<ILessonProgress>(
      `/courses/${courseId}/progress`,
    );
    return progress;
  } catch (error) {
    console.log("Error fetching lesson progress:", error);
    throw error;
  }
};

export const markLessonComplete = async (
  courseId: string,
  lessonId: string,
) => {
  try {
    const progress = await httpClient.post<ILessonProgress>(
      `/courses/${courseId}/progress/${lessonId}`,
      {},
    );
    return progress;
  } catch (error) {
    console.log("Error marking lesson complete:", error);
    throw error;
  }
};
