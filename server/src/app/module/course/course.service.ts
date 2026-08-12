import status from "http-status";
import { Course, Prisma } from "../../../generated/prisma/client";
import { CourseStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams, IQueryResult } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { getCached, invalidateCacheByPrefix, setCached } from "../../utils/cache";
import { assertPaidEnrollment } from "../../utils/enrollmentAccess";
import { courseFilterableFields, courseSearchableFields } from "./course.constant";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import {
  assertCourseOwnership,
  assertLessonOwnership,
  assertModuleOwnership,
  canAccessFullCourseContent,
} from "../../utils/ownership";
import {
  ICreateCoursePayload,
  ICreateLessonPayload,
  ICreateModulePayload,
  IUpdateCoursePayload,
  IUpdateLessonPayload,
  IUpdateModulePayload,
} from "./course.interface";

const reindexCourseAsync = (courseId: string) => {
  import("../rag/rag.service")
    .then(({ RAGService }) => RAGService.reindexCourse(courseId))
    .catch((error) => console.warn("[RAG] course reindex failed:", error));
};

const reindexCourseByLessonAsync = (lessonId: string) => {
  prisma.lesson
    .findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } },
    })
    .then((lesson) => {
      if (lesson?.module.courseId) {
        reindexCourseAsync(lesson.module.courseId);
      }
    })
    .catch((error) => console.warn("[RAG] course reindex failed:", error));
};

const removeCourseSourceAsync = (courseId: string) => {
  import("../rag/rag.service")
    .then(({ RAGService }) => RAGService.removeSource("COURSE", courseId))
    .catch((error) => console.warn("[RAG] course remove failed:", error));
};


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

  invalidateCacheByPrefix("course:list:");

  reindexCourseAsync(course.id);

  return course;
};

const LESSON_METADATA_SELECT = {
  id: true,
  title: true,
  description: true,
  videoDuration: true,
  order: true,
  isFree: true,
} as const;

const FULL_LESSON_SELECT = {
  ...LESSON_METADATA_SELECT,
  videoUrl: true,
  content: true,
} as const;

const getAllCourses = async (query: IQueryParams) => {
  // Cache catalog reads (30s TTL). Interactive searches and admin
  // management views stay uncached so results are always fresh.
  const isCacheable = !query.searchTerm;

  if (isCacheable) {
    const cacheKey = `course:list:${JSON.stringify(query)}`;
    const cached = getCached<IQueryResult<Course>>(cacheKey);
    if (cached) {
      return cached;
    }
  }

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
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          lessons: {
            where: { isDeleted: false },
            orderBy: { order: "asc" },
            select: LESSON_METADATA_SELECT,
          },
        },
      },
      reviews: true,
    })
    .paginate()
    .sort()
    .fields()
    .execute();

  if (isCacheable) {
    setCached(`course:list:${JSON.stringify(query)}`, result, 30);
  }

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
            select: LESSON_METADATA_SELECT,
          },
        },
      },
    },
  });

  return course;
};

const updateCourse = async (
  id: string,
  payload: IUpdateCoursePayload,
  user: IRequestUser,
) => {
  await assertCourseOwnership(user, id);

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

  invalidateCacheByPrefix("course:list:");

  reindexCourseAsync(id);

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

  invalidateCacheByPrefix("course:list:");

  removeCourseSourceAsync(id);

  return course;
};

const createModule = async (
  courseId: string,
  payload: ICreateModulePayload,
  user: IRequestUser,
) => {
  await assertCourseOwnership(user, courseId);

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

  reindexCourseAsync(courseId);

  return module;
};

const getModulesByCourse = async (
  courseId: string,
  user: IRequestUser,
) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const fullAccess = await canAccessFullCourseContent(user, courseId);

  const modules = await prisma.module.findMany({
    where: { courseId, isDeleted: false },
    orderBy: { order: "asc" },
    include: {
      lessons: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
        select: fullAccess ? FULL_LESSON_SELECT : LESSON_METADATA_SELECT,
      },
    },
  });

  return modules;
};

const updateModule = async (
  id: string,
  payload: IUpdateModulePayload,
  user: IRequestUser,
) => {
  await assertModuleOwnership(user, id);

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

  reindexCourseAsync(isModuleExist.courseId);

  return module;
};

const deleteModule = async (id: string, user: IRequestUser) => {
  await assertModuleOwnership(user, id);

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

  reindexCourseAsync(isModuleExist.courseId);

  return module;
};

const createLesson = async (
  moduleId: string,
  payload: ICreateLessonPayload,
  user: IRequestUser,
) => {
  await assertModuleOwnership(user, moduleId);

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

  reindexCourseAsync(lesson.module.courseId);

  return lesson;
};

const getLessonsByModule = async (
  moduleId: string,
  user: IRequestUser,
) => {
  const module = await prisma.module.findUnique({
    where: { id: moduleId, isDeleted: false },
  });

  if (!module) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  const fullAccess = await canAccessFullCourseContent(user, module.courseId);

  const lessons = await prisma.lesson.findMany({
    where: { moduleId, isDeleted: false },
    orderBy: { order: "asc" },
    select: fullAccess ? FULL_LESSON_SELECT : LESSON_METADATA_SELECT,
  });

  return lessons;
};

const updateLesson = async (
  id: string,
  payload: IUpdateLessonPayload,
  user: IRequestUser,
) => {
  await assertLessonOwnership(user, id);

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

  reindexCourseByLessonAsync(id);

  return lesson;
};

const deleteLesson = async (id: string, user: IRequestUser) => {
  await assertLessonOwnership(user, id);

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

  reindexCourseByLessonAsync(id);

  return lesson;
};

const getMyLessonProgress = async (courseId: string, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      courseId,
      isDeleted: false,
    },
  });

  if (!enrollment) {
    throw new AppError(
      status.FORBIDDEN,
      "You must be enrolled in the course to track progress",
    );
  }

  const [lessonProgress, totalLessons] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
      },
      select: { lessonId: true },
    }),
    prisma.lesson.count({
      where: {
        module: { courseId, isDeleted: false },
        isDeleted: false,
      },
    }),
  ]);

  return {
    completedLessonIds: lessonProgress.map((p) => p.lessonId),
    completedLessons: lessonProgress.length,
    totalLessons,
    progress: enrollment.progress,
    isCompleted: enrollment.isCompleted,
    completedAt: enrollment.completedAt,
  };
};

const markLessonComplete = async (
  courseId: string,
  lessonId: string,
  user: IRequestUser,
) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollment = await assertPaidEnrollment(student.id, courseId);

  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      isDeleted: false,
      module: { courseId, isDeleted: false },
    },
  });

  if (!lesson) {
    throw new AppError(status.NOT_FOUND, "Lesson not found");
  }

  return prisma.$transaction(async (tx) => {
    const lessonProgress = await tx.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    const [completedLessons, totalLessons] = await Promise.all([
      tx.lessonProgress.count({
        where: {
          enrollmentId: enrollment.id,
          isCompleted: true,
        },
      }),
      tx.lesson.count({
        where: {
          module: { courseId, isDeleted: false },
          isDeleted: false,
        },
      }),
    ]);

    const progress =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;
    const isCourseCompleted = totalLessons > 0 && completedLessons >= totalLessons;

    const updatedEnrollment = await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progress,
        isCompleted: isCourseCompleted,
        completedAt: isCourseCompleted
          ? enrollment.completedAt ?? new Date()
          : null,
      },
    });

    return {
      lessonProgress,
      completedLessons,
      totalLessons,
      progress: updatedEnrollment.progress,
      isCompleted: updatedEnrollment.isCompleted,
      completedAt: updatedEnrollment.completedAt,
    };
  });
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
  getMyLessonProgress,
  markLessonComplete,
};
