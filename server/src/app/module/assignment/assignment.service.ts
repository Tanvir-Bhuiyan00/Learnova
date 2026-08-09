import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  assertAssignmentOwnership,
  assertCourseOwnership,
} from "../../utils/ownership";
import {
  ICreateAssignmentPayload,
  IGradeSubmissionPayload,
  IUpdateAssignmentPayload,
} from "./assignment.interface";

const createAssignment = async (
  user: IRequestUser,
  payload: ICreateAssignmentPayload,
) => {
  await assertCourseOwnership(user, payload.courseId);

  const result = await prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      instructions: payload.instructions,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      totalMarks: payload.totalMarks,
      courseId: payload.courseId,
    },
  });

  return result;
};

const getAllAssignments = async (courseId?: string) => {
  const where: Record<string, unknown> = { isDeleted: false };

  if (courseId) {
    where.courseId = courseId;
  }

  const assignments = await prisma.assignment.findMany({
    where: where as any,
    include: {
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments;
};

const getAssignmentById = async (assignmentId: string) => {
  const assignment = await prisma.assignment.findFirstOrThrow({
    where: { id: assignmentId, isDeleted: false },
    include: {
      course: true,
      submissions: {
        where: { isDeleted: false },
        include: { student: true },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  return assignment;
};

const updateAssignment = async (
  user: IRequestUser,
  assignmentId: string,
  payload: IUpdateAssignmentPayload,
) => {
  await assertAssignmentOwnership(user, assignmentId);

  const updateData: Record<string, unknown> = { ...payload };
  if (payload.dueDate) {
    updateData.dueDate = new Date(payload.dueDate);
  }

  const result = await prisma.assignment.update({
    where: { id: assignmentId },
    data: updateData as any,
  });

  return result;
};

const deleteAssignment = async (user: IRequestUser, assignmentId: string) => {
  await assertAssignmentOwnership(user, assignmentId);

  const result = await prisma.assignment.update({
    where: { id: assignmentId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result;
};

const submitAssignment = async (
  user: IRequestUser,
  assignmentId: string,
  fileUrl?: string,
  content?: string,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  await prisma.assignment.findFirstOrThrow({
    where: { id: assignmentId, isDeleted: false },
  });

  const existing = await prisma.assignmentSubmission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: student.id,
      },
    },
  });

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already submitted this assignment",
    );
  }

  if (!fileUrl && !content) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide either a file or text content",
    );
  }

  const result = await prisma.assignmentSubmission.create({
    data: {
      fileUrl,
      content,
      assignmentId,
      studentId: student.id,
    },
    include: { student: true },
  });

  return result;
};

const getSubmissions = async (
  user: IRequestUser,
  assignmentId: string,
) => {
  await assertAssignmentOwnership(user, assignmentId);

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId, isDeleted: false },
    include: { student: true },
    orderBy: { submittedAt: "desc" },
  });

  return submissions;
};

const gradeSubmission = async (
  user: IRequestUser,
  submissionId: string,
  payload: IGradeSubmissionPayload,
) => {
  const submission = await prisma.assignmentSubmission.findUniqueOrThrow({
    where: { id: submissionId },
    include: { assignment: true },
  });

  await assertAssignmentOwnership(user, submission.assignmentId);

  if (payload.marks > submission.assignment.totalMarks) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Marks cannot exceed ${submission.assignment.totalMarks}`,
    );
  }

  const result = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      marks: payload.marks,
      feedback: payload.feedback,
      gradedAt: new Date(),
    },
    include: { student: true, assignment: true },
  });

  return result;
};

export const AssignmentService = {
  createAssignment,
  getAllAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
};
