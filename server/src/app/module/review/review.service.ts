import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";

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

    return review;
  });

  return result;
};

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      student: true,
      course: true,
      instructor: true,
    },
  });

  return reviews;
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