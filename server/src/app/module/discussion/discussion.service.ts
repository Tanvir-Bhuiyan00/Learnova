import httpStatus from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  ICreateDiscussionPayload,
  ICreateReplyPayload,
  IUpdateDiscussionPayload,
} from "./discussion.interface";

const createDiscussion = async (
  user: IRequestUser,
  payload: ICreateDiscussionPayload,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  await prisma.course.findUniqueOrThrow({
    where: { id: payload.courseId },
  });

  // Only enrolled students may post in a course's discussion board.
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      courseId: payload.courseId,
      isDeleted: false,
      payment: { status: PaymentStatus.SUCCEEDED },
    },
    select: { id: true },
  });

  if (!enrollment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You must be enrolled in the course to post in its discussion",
    );
  }

  const result = await prisma.discussion.create({
    data: {
      title: payload.title,
      content: payload.content,
      courseId: payload.courseId,
      studentId: student.id,
    },
    include: { student: true },
  });

  return result;
};

const getAllDiscussions = async (
  query: IQueryParams,
  courseId?: string,
) => {
  const queryBuilder = new QueryBuilder(prisma.discussion, query);

  const builder = queryBuilder
    .where({
      isDeleted: false,
      ...(courseId ? { courseId } : {}),
    } as any)
    .include({
      student: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      _count: { select: { replies: { where: { isDeleted: false } } } },
    } as any)
    .paginate()
    .sort();

  builder.getQuery().orderBy = [{ isPinned: "desc" }, { createdAt: "desc" }];

  const result = await builder.execute();

  return result;
};

const getDiscussionById = async (discussionId: string) => {
  const discussion = await prisma.discussion.findFirstOrThrow({
    where: { id: discussionId, isDeleted: false },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
        },
      },
      replies: {
        where: { isDeleted: false },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          instructor: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
            },
          },
          replies: {
            where: { isDeleted: false },
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
              instructor: {
                select: {
                  id: true,
                  name: true,
                  profilePhoto: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return discussion;
};

const updateDiscussion = async (
  user: IRequestUser,
  discussionId: string,
  payload: IUpdateDiscussionPayload,
) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const discussion = await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId },
  });

  if (discussion.studentId !== student.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only edit your own discussion");
  }

  const result = await prisma.discussion.update({
    where: { id: discussionId },
    data: payload,
  });

  return result;
};

const deleteDiscussion = async (user: IRequestUser, discussionId: string) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const discussion = await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId },
  });

  if (discussion.studentId !== student.id) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own discussion");
  }

  const result = await prisma.discussion.update({
    where: { id: discussionId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result;
};

const togglePinDiscussion = async (
  user: IRequestUser,
  discussionId: string,
) => {
  const discussion = await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId },
    select: { id: true, courseId: true, isPinned: true },
  });

  // Only the owning instructor (or an admin) may pin a discussion.
  const instructor = await prisma.instructor.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });

  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isAdmin) {
    const course = await prisma.course.findUnique({
      where: { id: discussion.courseId },
      select: { instructorId: true },
    });

    if (!instructor || course?.instructorId !== instructor.id) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Only the course instructor can pin discussions",
      );
    }
  }

  const result = await prisma.discussion.update({
    where: { id: discussionId },
    data: { isPinned: !discussion.isPinned },
  });

  return result;
};

const toggleResolveDiscussion = async (
  user: IRequestUser,
  discussionId: string,
) => {
  const discussion = await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId },
  });

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  const instructor = await prisma.instructor.findUnique({
    where: { userId: user.userId },
  });

  const isOwner = student && discussion.studentId === student.id;
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  // Instructors may only resolve discussions in their own courses.
  const isCourseInstructor = instructor
    ? (
        await prisma.course.findUnique({
          where: { id: discussion.courseId },
          select: { instructorId: true },
        })
      )?.instructorId === instructor.id
    : false;

  if (!isOwner && !isAdmin && !isCourseInstructor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the discussion owner, the course instructor, or an admin can resolve this",
    );
  }

  const result = await prisma.discussion.update({
    where: { id: discussionId },
    data: { isResolved: !discussion.isResolved },
  });

  return result;
};

const createReply = async (
  user: IRequestUser,
  discussionId: string,
  payload: ICreateReplyPayload,
) => {
  await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId, isDeleted: false },
  });

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  const instructor = await prisma.instructor.findUnique({
    where: { userId: user.userId },
  });

  if (!student && !instructor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only students and instructors can reply",
    );
  }

  const result = await prisma.discussionReply.create({
    data: {
      content: payload.content,
      discussionId,
      studentId: student?.id ?? null,
      instructorId: instructor?.id ?? null,
      parentId: payload.parentId ?? null,
    },
    include: { student: true, instructor: true },
  });

  return result;
};

const deleteReply = async (user: IRequestUser, replyId: string) => {
  const reply = await prisma.discussionReply.findUniqueOrThrow({
    where: { id: replyId },
  });

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  const instructor = await prisma.instructor.findUnique({
    where: { userId: user.userId },
  });

  const isStudentOwner = student && reply.studentId === student.id;
  const isInstructorOwner = instructor && reply.instructorId === instructor.id;

  if (!isStudentOwner && !isInstructorOwner) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own reply",
    );
  }

  const result = await prisma.discussionReply.update({
    where: { id: replyId },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  return result;
};

export const DiscussionService = {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  togglePinDiscussion,
  toggleResolveDiscussion,
  createReply,
  deleteReply,
};
