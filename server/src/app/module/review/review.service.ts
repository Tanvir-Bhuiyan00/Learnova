import status from "http-status";
import { NotificationType, PaymentStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

const recalculateCourseRating = async (
  tx: Prisma.TransactionClient,
  courseId: string,
) => {
  const averageRating = await tx.review.aggregate({
    where: { courseId },
    _avg: { rating: true },
  });

  await tx.course.update({
    where: { id: courseId },
    data: { averageRating: averageRating._avg.rating ?? 0 },
  });
};

const giveReview = async (
  user: IRequestUser,
  payload: ICreateReviewPayload,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const enrollment = await prisma.enrollment.findUniqueOrThrow({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: payload.courseId,
      },
    },
    include: { payment: true },
  });

  if (
    !enrollment.payment ||
    enrollment.payment.status !== PaymentStatus.SUCCEEDED
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review after payment is completed",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: payload.courseId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed this course. You can update your review instead.",
    );
  }

  const course = await prisma.course.findUniqueOrThrow({
    where: { id: payload.courseId },
  });

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        rating: payload.rating,
        comment: payload.comment,
        studentId: student.id,
        courseId: payload.courseId,
        instructorId: course.instructorId,
      },
    });

    const averageRating = await tx.review.aggregate({
      where: {
        instructorId: course.instructorId,
      },
      _avg: {
        rating: true,
      },
    });

    if (course.instructorId) {
      await tx.instructor.update({
        where: { id: course.instructorId },
        data: {
          averageRating: averageRating._avg.rating as number,
        },
      });
    }

    await recalculateCourseRating(tx, payload.courseId);

    const instructor = await tx.instructor.findUnique({
      where: { id: course.instructorId },
      select: { userId: true },
    });

    if (instructor?.userId) {
      await tx.notification.create({
        data: {
          userId: instructor.userId,
          title: "New review",
          message: `${student.name} left a ${payload.rating}-star review on "${course.title}".`,
          type: NotificationType.REVIEW,
        },
      });
    }

    return review;
  });

  return result;
};

const getAllReviews = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.review, query);

  const result = await queryBuilder
    .where({ isDeleted: false } as any)
    .filter()
    .include({
      // Public endpoint: only expose display fields, never student emails
      // or instructor contact details.
      student: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
        },
      },
      instructor: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
    } as any)
    .paginate()
    .sort()
    .execute();

  return result;
};

const myReviews = async (user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (student) {
    return await prisma.review.findMany({
      where: { studentId: student.id },
      include: {
        course: true,
        instructor: true,
      },
    });
  }

  const instructor = await prisma.instructor.findUnique({
    where: { userId: user.userId },
  });

  if (instructor) {
    return await prisma.review.findMany({
      where: { instructorId: instructor.id },
      include: {
        student: true,
        course: true,
      },
    });
  }

  throw new AppError(status.BAD_REQUEST, "Only students and instructors can view reviews");
};

const updateReview = async (
  user: IRequestUser,
  reviewId: string,
  payload: IUpdateReviewPayload,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
  });

  if (reviewData.studentId !== student.id) {
    throw new AppError(status.BAD_REQUEST, "This is not your review!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: { ...payload },
    });

    const averageRating = await tx.review.aggregate({
      where: { instructorId: reviewData.instructorId },
      _avg: { rating: true },
    });

    if (reviewData.instructorId) {
      await tx.instructor.update({
        where: { id: reviewData.instructorId },
        data: { averageRating: averageRating._avg.rating as number },
      });
    }

    await recalculateCourseRating(tx, reviewData.courseId);

    return updatedReview;
  });

  return result;
};

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
  });

  if (reviewData.studentId !== student.id) {
    throw new AppError(status.BAD_REQUEST, "This is not your review!");
  }

  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: { id: reviewId },
    });

    const averageRating = await tx.review.aggregate({
      where: { instructorId: deletedReview.instructorId },
      _avg: { rating: true },
    });

    if (deletedReview.instructorId) {
      await tx.instructor.update({
        where: { id: deletedReview.instructorId },
        data: { averageRating: averageRating._avg.rating as number },
      });
    }

    await recalculateCourseRating(tx, deletedReview.courseId);

    return deletedReview;
  });

  return result;
};

export const ReviewService = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,
};