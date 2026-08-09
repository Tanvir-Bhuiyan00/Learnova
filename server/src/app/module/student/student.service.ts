import status from "http-status";
import { Student, Prisma } from "../../../generated/prisma/client";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IUpdateStudentPayload } from "./student.interface";

const studentSearchableFields = ["name", "email"];
const studentFilterableFields = ["isDeleted"];

const getMyProfile = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId, isDeleted: false },
    include: { user: true },
  });
  return student;
};

const updateMyProfile = async (userId: string, payload: IUpdateStudentPayload) => {
  const student = await prisma.student.findUnique({
    where: { userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedStudent = await tx.student.update({
      where: { userId },
      data: payload,
    });

    if (payload.name || payload.profilePhoto) {
      await tx.user.update({
        where: { id: userId },
        data: {
          ...(payload.name && { name: payload.name }),
          ...(payload.profilePhoto && { image: payload.profilePhoto }),
        },
      });
    }

    return updatedStudent;
  });

  return result;
};

const deleteMyAccount = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId },
    });
  });

  return { message: "Account deleted successfully" };
};

const getDashboardStats = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student not found");
  }

  const [totalEnrollments, completedEnrollments, totalCertificates, totalReviews, totalQuizAttempts] =
    await Promise.all([
      prisma.enrollment.count({ where: { studentId: student.id, isDeleted: false } }),
      prisma.enrollment.count({ where: { studentId: student.id, isDeleted: false, isCompleted: true } }),
      prisma.certificate.count({ where: { studentId: student.id } }),
      prisma.review.count({ where: { studentId: student.id } }),
      prisma.quizAttempt.count({ where: { studentId: student.id } }),
    ]);

  return {
    totalEnrollments,
    completedEnrollments,
    totalCertificates,
    totalReviews,
    totalQuizAttempts,
  };
};

const getAllStudents = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Student,
    Prisma.StudentWhereInput,
    Prisma.StudentInclude
  >(prisma.student, query, {
    searchableFields: studentSearchableFields,
    filterableFields: studentFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
    })
    .dynamicInclude({})
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getStudentById = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      enrollments: true,
      reviews: true,
    },
  });
  return student;
};

const updateStudent = async (id: string, payload: IUpdateStudentPayload) => {
  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedStudent = await tx.student.update({
      where: { id },
      data: payload,
    });

    if (payload.name || payload.profilePhoto) {
      await tx.user.update({
        where: { id: student.userId },
        data: {
          ...(payload.name && { name: payload.name }),
          ...(payload.profilePhoto && { image: payload.profilePhoto }),
        },
      });
    }

    return updatedStudent;
  });

  return result;
};

const deleteStudent = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.student.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: { id: student.userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: student.userId },
    });
  });

  return { message: "Student deleted successfully" };
};

export const StudentService = {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
  getDashboardStats,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
