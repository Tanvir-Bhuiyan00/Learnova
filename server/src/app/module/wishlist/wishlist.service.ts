import httpStatus from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IAddWishlistItemPayload } from "./wishlist.interface";

const addItem = async (user: IRequestUser, payload: IAddWishlistItemPayload) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      studentId_courseId: {
        studentId: student.id,
        courseId: payload.courseId,
      },
    },
  });

  if (existing) {
    throw new AppError(httpStatus.CONFLICT, "Course already in wishlist");
  }

  await prisma.course.findUniqueOrThrow({
    where: { id: payload.courseId },
  });

  const result = await prisma.wishlistItem.create({
    data: {
      studentId: student.id,
      courseId: payload.courseId,
    },
    include: { course: true },
  });

  return result;
};

const getMyWishlist = async (user: IRequestUser) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const items = await prisma.wishlistItem.findMany({
    where: { studentId: student.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  return items;
};

const removeItem = async (user: IRequestUser, wishlistItemId: string) => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const item = await prisma.wishlistItem.findUniqueOrThrow({
    where: { id: wishlistItemId },
  });

  if (item.studentId !== student.id) {
    throw new AppError(httpStatus.FORBIDDEN, "This item is not in your wishlist");
  }

  await prisma.wishlistItem.delete({ where: { id: wishlistItemId } });

  return null;
};

export const WishlistService = {
  addItem,
  getMyWishlist,
  removeItem,
};
