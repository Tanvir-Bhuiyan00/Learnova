import httpStatus from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { CertificateUtils } from "./certificate.utils";

const generateCertificate = async (
  user: IRequestUser,
  enrollmentId: string,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const enrollment = await prisma.enrollment.findFirstOrThrow({
    where: { id: enrollmentId, studentId: student.id },
    include: {
      course: {
        include: { instructor: true },
      },
      payment: true,
    },
  });

  if (enrollment.payment?.status !== PaymentStatus.SUCCEEDED) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Payment for this course has not been completed",
    );
  }

  if (!enrollment.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Course is not yet completed",
    );
  }

  const existing = await prisma.certificate.findUnique({
    where: { enrollmentId },
  });

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "Certificate already generated for this enrollment",
    );
  }

  const result = await prisma.certificate.create({
    data: {
      certificateUrl: "",
      studentId: student.id,
      courseId: enrollment.courseId,
      enrollmentId,
    },
  });

  try {
    const certificateUrl = await CertificateUtils.generateCertificatePDF({
      studentName: student.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor.name,
      issuedAt: new Date(),
      certificateId: result.id,
    });

    return await prisma.certificate.update({
      where: { id: result.id },
      data: { certificateUrl },
    });
  } catch (error) {
    await prisma.certificate.delete({ where: { id: result.id } });
    throw error;
  }
};

const getMyCertificates = async (user: IRequestUser) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const certificates = await prisma.certificate.findMany({
    where: { studentId: student.id, isDeleted: false },
    include: {
      course: true,
    },
    orderBy: { issuedAt: "desc" },
  });

  return certificates;
};

const getCertificateById = async (certificateId: string, userId: string, role: string) => {
  const certificate = await prisma.certificate.findFirstOrThrow({
    where: { id: certificateId, isDeleted: false },
    include: {
      student: true,
      course: true,
    },
  });

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  const isOwner = student?.id === certificate.studentId;
  const isStaff = role === "ADMIN" || role === "SUPER_ADMIN";

  if (!isOwner && !isStaff) {
    throw new AppError(httpStatus.NOT_FOUND, "Certificate not found");
  }

  return certificate;
};

const verifyCertificate = async (certificateId: string) => {
  const certificate = await prisma.certificate.findFirstOrThrow({
    where: { id: certificateId, isDeleted: false },
    include: {
      student: true,
      course: true,
      enrollment: true,
    },
  });

  return {
    isValid: true,
    studentName: certificate.student.name,
    courseName: certificate.course.title,
    issuedAt: certificate.issuedAt,
    certificateId: certificate.id,
  };
};

export const CertificateService = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
  verifyCertificate,
};
