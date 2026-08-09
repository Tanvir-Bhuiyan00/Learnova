import httpStatus from "http-status";
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
      student: true,
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
      student: true,
      replies: {
        where: { isDeleted: false },
        include: {
          student: true,
          instructor: true,
          replies: {
            where: { isDeleted: false },
            include: {
              student: true,
              instructor: true,
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

const togglePinDiscussion = async (discussionId: string) => {
  const discussion = await prisma.discussion.findUniqueOrThrow({
    where: { id: discussionId },
  });

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
  const isInstructor = !!instructor;

  if (!isOwner && !isInstructor) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the discussion owner or an instructor can resolve this",
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
