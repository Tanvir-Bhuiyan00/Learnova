import status from "http-status";
import { PaymentStatus } from "../../generated/prisma/enums";
import AppError from "../errorHelpers/AppError";
import { IRequestUser } from "../interfaces/requestUser.interface";
import { prisma } from "../lib/prisma";

export const isAdminOrSuperAdmin = (user: IRequestUser) =>
  user.role === "ADMIN" || user.role === "SUPER_ADMIN";

export const getInstructorProfile = async (userId: string) =>
  prisma.instructor.findUnique({ where: { userId } });

export const requireInstructor = async (user: IRequestUser) => {
  const instructor = await getInstructorProfile(user.userId);

  if (!instructor) {
    throw new AppError(status.FORBIDDEN, "Instructor profile not found");
  }

  return instructor;
};

export const assertCourseOwnership = async (
  user: IRequestUser,
  courseId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const instructor = await requireInstructor(user);

  const course = await prisma.course.findFirst({
    where: { id: courseId, isDeleted: false },
    select: { instructorId: true },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  if (course.instructorId !== instructor.id) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only manage your own courses",
    );
  }
};

export const assertModuleOwnership = async (
  user: IRequestUser,
  moduleId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { courseId: true },
  });

  if (!module) {
    throw new AppError(status.NOT_FOUND, "Module not found");
  }

  await assertCourseOwnership(user, module.courseId);
};

export const assertLessonOwnership = async (
  user: IRequestUser,
  lessonId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { moduleId: true },
  });

  if (!lesson) {
    throw new AppError(status.NOT_FOUND, "Lesson not found");
  }

  await assertModuleOwnership(user, lesson.moduleId);
};

export const assertQuizOwnership = async (
  user: IRequestUser,
  quizId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: { courseId: true },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  await assertCourseOwnership(user, quiz.courseId);
};

export const assertQuestionOwnership = async (
  user: IRequestUser,
  questionId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const question = await prisma.quizQuestion.findUnique({
    where: { id: questionId },
    select: { quizId: true },
  });

  if (!question) {
    throw new AppError(status.NOT_FOUND, "Question not found");
  }

  await assertQuizOwnership(user, question.quizId);
};

export const assertAssignmentOwnership = async (
  user: IRequestUser,
  assignmentId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { courseId: true },
  });

  if (!assignment) {
    throw new AppError(status.NOT_FOUND, "Assignment not found");
  }

  await assertCourseOwnership(user, assignment.courseId);
};

export const assertInstructorSelf = async (
  user: IRequestUser,
  targetInstructorId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return;

  const instructor = await requireInstructor(user);

  if (instructor.id !== targetInstructorId) {
    throw new AppError(
      status.FORBIDDEN,
      "You can only update your own instructor profile",
    );
  }
};

export const canAccessFullCourseContent = async (
  user: IRequestUser,
  courseId: string,
) => {
  if (isAdminOrSuperAdmin(user)) return true;

  const instructor = await getInstructorProfile(user.userId);

  if (instructor) {
    const owned = await prisma.course.findFirst({
      where: { id: courseId, instructorId: instructor.id, isDeleted: false },
      select: { id: true },
    });

    if (owned) return true;
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (student) {
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: student.id,
        courseId,
        isDeleted: false,
        payment: { status: PaymentStatus.SUCCEEDED },
      },
      select: { id: true },
    });

    if (enrollment) return true;
  }

  return false;
};
