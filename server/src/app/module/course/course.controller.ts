import { Request, Response } from "express";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { CourseService } from "./course.service";

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    thumbnail: req.file?.path,
  };

  const result = await CourseService.createCourse(payload, req.user.userId);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Course created successfully",
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;

  const result = await CourseService.getAllCourses(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Courses fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CourseService.getCourseById(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Course fetched successfully",
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await CourseService.updateCourse(id as string, payload, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Course updated successfully",
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CourseService.deleteCourse(id as string);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Course deleted successfully",
    data: result,
  });
});

const createModule = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const payload = req.body;

  const result = await CourseService.createModule(courseId as string, payload, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Module created successfully",
    data: result,
  });
});

const getModulesByCourse = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const result = await CourseService.getModulesByCourse(courseId as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Modules fetched successfully",
    data: result,
  });
});

const updateModule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await CourseService.updateModule(id as string, payload, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Module updated successfully",
    data: result,
  });
});

const deleteModule = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CourseService.deleteModule(id as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Module deleted successfully",
    data: result,
  });
});

const createLesson = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;
  const payload = req.body;

  const result = await CourseService.createLesson(moduleId as string, payload, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Lesson created successfully",
    data: result,
  });
});

const getLessonsByModule = catchAsync(async (req: Request, res: Response) => {
  const { moduleId } = req.params;

  const result = await CourseService.getLessonsByModule(moduleId as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Lessons fetched successfully",
    data: result,
  });
});

const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const result = await CourseService.updateLesson(id as string, payload, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Lesson updated successfully",
    data: result,
  });
});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await CourseService.deleteLesson(id as string, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Lesson deleted successfully",
    data: result,
  });
});

const getMyLessonProgress = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;

  const result = await CourseService.getMyLessonProgress(
    courseId as string,
    req.user,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Lesson progress fetched successfully",
    data: result,
  });
});

const markLessonComplete = catchAsync(async (req: Request, res: Response) => {
  const { courseId, lessonId } = req.params;

  const result = await CourseService.markLessonComplete(
    courseId as string,
    lessonId as string,
    req.user,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Lesson marked as complete",
    data: result,
  });
});

export const CourseController = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  createModule,
  getModulesByCourse,
  updateModule,
  deleteModule,
  createLesson,
  getLessonsByModule,
  updateLesson,
  deleteLesson,
  getMyLessonProgress,
  markLessonComplete,
};
