import status from "http-status";
import { DiscountType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";

const addToCart = async (payload: { courseId: string }, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const course = await prisma.course.findUnique({
    where: { id: payload.courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const cart = await prisma.cart.upsert({
    where: { studentId: student.id },
    update: {},
    create: { studentId: student.id },
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_courseId: { cartId: cart.id, courseId: payload.courseId } },
  });

  if (existingItem) {
    throw new AppError(status.CONFLICT, "Course already in cart");
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      courseId: payload.courseId,
    },
  });

  return { message: "Course added to cart" };
};

const removeFromCart = async (courseId: string, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const cart = await prisma.cart.findUnique({
    where: { studentId: student.id },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  const item = await prisma.cartItem.findUnique({
    where: { cartId_courseId: { cartId: cart.id, courseId } },
  });

  if (!item) {
    throw new AppError(status.NOT_FOUND, "Course not found in cart");
  }

  await prisma.cartItem.delete({
    where: { id: item.id },
  });

  return { message: "Course removed from cart" };
};

const getCart = async (user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const cart = await prisma.cart.findUnique({
    where: { studentId: student.id },
    include: {
      items: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              thumbnail: true,
              price: true,
              discountPrice: true,
              currency: true,
            },
          },
        },
      },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    return { items: [], subtotal: 0, discount: 0, total: 0 };
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.course.discountPrice ?? item.course.price;
    return sum + price * item.quantity;
  }, 0);

  let discount = 0;
  if (cart.coupon) {
    discount = calculateDiscount(subtotal, cart.coupon);
  }

  const total = Math.max(0, subtotal - discount);

  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      courseId: item.courseId,
      quantity: item.quantity,
      course: item.course,
    })),
    coupon: cart.coupon
      ? {
          id: cart.coupon.id,
          code: cart.coupon.code,
          discountType: cart.coupon.discountType,
          discountValue: cart.coupon.discountValue,
        }
      : null,
    subtotal,
    discount,
    total,
  };
};

const applyCoupon = async (payload: { code: string }, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const cart = await prisma.cart.findUnique({
    where: { studentId: student.id },
    include: {
      items: {
        include: {
          course: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(status.BAD_REQUEST, "Cart is empty");
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: payload.code },
    include: { courses: true },
  });

  if (!coupon || coupon.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Coupon not found");
  }

  if (!coupon.isActive) {
    throw new AppError(status.BAD_REQUEST, "Coupon is no longer active");
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  if (
    coupon.maxUsage !== null &&
    coupon.maxUsage !== undefined &&
    coupon.usedCount >= coupon.maxUsage
  ) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }

  const subtotal = cart.items.reduce((sum, item) => {
    const price = item.course.discountPrice ?? item.course.price;
    return sum + price * item.quantity;
  }, 0);

  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    throw new AppError(
      status.BAD_REQUEST,
      `Minimum purchase amount is ${coupon.minPurchase}`,
    );
  }

  if (coupon.courses.length > 0) {
    const cartCourseIds = cart.items.map((item) => item.courseId);
    const allEligible = cartCourseIds.every((id) =>
      coupon.courses.some((c) => c.id === id),
    );
    if (!allEligible) {
      throw new AppError(
        status.BAD_REQUEST,
        "Coupon is not applicable to all courses in cart",
      );
    }
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: coupon.id },
  });

  return { message: "Coupon applied successfully" };
};

const removeCoupon = async (user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const cart = await prisma.cart.findUnique({
    where: { studentId: student.id },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  if (!cart.couponId) {
    throw new AppError(status.BAD_REQUEST, "No coupon applied");
  }

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: null },
  });

  return { message: "Coupon removed successfully" };
};

function calculateDiscount(
  subtotal: number,
  coupon: { discountType: string; discountValue: number },
): number {
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    return (subtotal * coupon.discountValue) / 100;
  }
  return coupon.discountValue;
}

export const CartService = {
  addToCart,
  removeFromCart,
  getCart,
  applyCoupon,
  removeCoupon,
};
