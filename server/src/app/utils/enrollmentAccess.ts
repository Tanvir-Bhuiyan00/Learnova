import httpStatus from "http-status";
import { PaymentStatus } from "../../generated/prisma/enums";
import AppError from "../errorHelpers/AppError";
import { prisma } from "../lib/prisma";

/**
 * Resolves an active enrollment for a student in a course and verifies the
 * payment has been completed (free courses have a SUCCEEDED zero-amount
 * payment row). Throws FORBIDDEN otherwise.
 */
export const assertPaidEnrollment = async (
  studentId: string,
  courseId: string,
) => {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      isDeleted: false,
    },
    include: { payment: true },
  });

  if (!enrollment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You must be enrolled in the course to access this content",
    );
  }

  if (enrollment.payment?.status !== PaymentStatus.SUCCEEDED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Payment for this course has not been completed",
    );
  }

  return enrollment;
};
