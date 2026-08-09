import status from "http-status";
import { Course, Prisma } from "../../../generated/prisma/client";
import { CourseStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { courseFilterableFields, courseSearchableFields } from "./course.constant";
import {
  ICreateCoursePayload,
  ICreateLessonPayload,
  ICreateModulePayload,
  IUpdateCoursePayload,
  IUpdateLessonPayload,
  IUpdateModulePayload,
} from "./course.interface";

const createCourse = async (payload: ICreateCoursePayload, userId: string) => {
  const instructor = await prisma.instructor.findUnique({
    where: { userId },
  });

  if (!instructor) {
    throw new AppError(status.NOT_FOUND, "Instructor profile not found");
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId, isDeleted: false },
  });

  if (!category) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const existingCourse = await prisma.course.findFirst({
    where: {
      title: payload.title,
      instructorId: instructor.id,
      isDeleted: false,
    },
  });

  if (existingCourse) {
    throw new AppError(
      status.CONFLICT,
      "You already have a course with this title",
    );
  }

  const course = await prisma.course.create({
    data: {
      title: payload.title,
      description: payload.description,
      thumbnail: payload.thumbnail,
      price: payload.price ?? 0,
      discountPrice: payload.discountPrice,
      currency: payload.currency ?? "BDT",
      level: payload.level,
      language: payload.language ?? "English",
      categoryId: payload.categoryId,
      instructorId: instructor.id,
    },
    include: {
      category: true,
      instructor: {
        include: { user: true },
      },
    },
  });

  return course;
};

const getAllCourses = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Course,
    Prisma.CourseWhereInput,
    Prisma.CourseInclude
  >(prisma.course, query, {
    searchableFields: courseSearchableFields,
    filterableFields: courseFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      category: true,
      instructor: {
        include: { user: true },
      },
    })
    .dynamicInclude({
      modules: {
        include: { lessons: true },
      },
      enrollments: true,
      reviews: true,
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getCourseById = async (id: string) => {
  const course = await prisma.course.findUnique({
    where: { id, isDeleted: false },
    include: {
      category: true,
      instructor: {
        include: { user: true },
      },
      modules: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { isDeleted: false },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  return course;
};

const updateCourse = async (id: string, payload: IUpdateCoursePayload) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id },
  });

  if (!isCourseExist) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId, isDeleted: false },
    });

    if (!category) {
      throw new AppError(status.NOT_FOUND, "Category not found");
    }
  }

  const course = await prisma.course.update({
    where: { id },
    data: payload,
    include: {
      category: true,
      instructor: {
        include: { user: true },
      },
    },
  });

  return course;
};

const deleteCourse = async (id: string) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id },
  });

  if (!isCourseExist) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const course = await prisma.course.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      status: CourseStatus.ARCHIVED,
    },
  });

  return course;
};

const createModule = async (courseId: string, payload: ICreateModulePayload) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const existingModule = await prisma.module.findUnique({
    where: {
      courseId_order: { courseId, order: payload.order },
    },
  });

  if (existingModule) {
    throw new AppError(
      status.CONFLICT,
      `A module with order ${payload.order} already exists in this course`,
    );
  }

  const module = await prisma.module.create({
    data: {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      courseId,
    },
  });

  return module;
};

const getModulesByCourse = async (courseId: string) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const modules = await prisma.module.findMany({
    where: { courseId, isDeleted: false },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
      },
    },
  });

  return modules;
};

const updateModule = async (id: string, payload: IUpdateModulePayload) => {
  const isModuleExist = await prisma.module.findUnique({
    where: { id },
  });

  if (!isModuleExist) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  if (payload.order && payload.order !== isModuleExist.order) {
    const duplicateModule = await prisma.module.findUnique({
      where: {
        courseId_order: {
          courseId: isModuleExist.courseId,
          order: payload.order,
        },
      },
    });

    if (duplicateModule) {
      throw new AppError(
        status.CONFLICT,
        `A module with order ${payload.order} already exists in this course`,
      );
    }
  }

  const module = await prisma.module.update({
    where: { id },
    data: payload,
  });

  return module;
};

const deleteModule = async (id: string) => {
  const isModuleExist = await prisma.module.findUnique({
    where: { id },
  });

  if (!isModuleExist) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  const module = await prisma.module.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return module;
};

const createLesson = async (moduleId: string, payload: ICreateLessonPayload) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId, isDeleted: false },
  });

  if (!module) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  const existingLesson = await prisma.lesson.findUnique({
    where: {
      moduleId_order: { moduleId, order: payload.order },
    },
  });

  if (existingLesson) {
    throw new AppError(
      status.CONFLICT,
      `A lesson with order ${payload.order} already exists in this module`,
    );
  }

  const lesson = await prisma.lesson.create({
    data: {
      title: payload.title,
      description: payload.description,
      videoUrl: payload.videoUrl,
      videoDuration: payload.videoDuration,
      content: payload.content,
      order: payload.order,
      isFree: payload.isFree ?? false,
      moduleId,
    },
    include: {
      module: true,
    },
  });

  return lesson;
};

const getLessonsByModule = async (moduleId: string) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId, isDeleted: false },
  });

  if (!module) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  const lessons = await prisma.lesson.findMany({
    where: { moduleId, isDeleted: false },
    orderBy: { order: "asc" },
  });

  return lessons;
};

const updateLesson = async (id: string, payload: IUpdateLessonPayload) => {
  const isLessonExist = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!isLessonExist) {
    throw new AppError(status.NOT_FOUND, "Lesson not found");
  }

  if (payload.order && payload.order !== isLessonExist.order) {
    const duplicateLesson = await prisma.lesson.findUnique({
      where: {
        moduleId_order: {
          moduleId: isLessonExist.moduleId,
          order: payload.order,
        },
      },
    });

    if (duplicateLesson) {
      throw new AppError(
        status.CONFLICT,
        `A lesson with order ${payload.order} already exists in this module`,
      );
    }
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: payload,
  });

  return lesson;
};

const deleteLesson = async (id: string) => {
  const isLessonExist = await prisma.lesson.findUnique({
    where: { id },
  });

  if (!isLessonExist) {
    throw new AppError(status.NOT_FOUND, "Lesson not found");
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return lesson;
};

export const CourseService = {
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
};
