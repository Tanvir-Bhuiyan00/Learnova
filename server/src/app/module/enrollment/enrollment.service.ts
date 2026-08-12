import status from "http-status";
import { CourseStatus, NotificationType, PaymentStatus } from "../../../generated/prisma/enums";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import {
  enrollmentFilterableFields,
  enrollmentSearchableFields,
} from "./enrollment.constant";
import { stripe } from "../../config/stripe.config";
import { assertCouponValid, decrementCouponUsage, incrementCouponUsage } from "../../utils/coupon";
import { calculateCartTotals, calculateItemDiscount } from "../../utils/couponMath";

const checkoutCart = async (user: IRequestUser) => {
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
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(status.BAD_REQUEST, "Cart is empty");
  }

  if (cart.coupon) {
    assertCouponValid(cart.coupon);
  }

  for (const item of cart.items) {
    if (
      item.course.isDeleted ||
      item.course.status !== CourseStatus.PUBLISHED
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        `Course "${item.course.title}" is not available for enrollment`,
      );
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: item.courseId,
        },
      },
    });

    if (existingEnrollment) {
      throw new AppError(
        status.CONFLICT,
        `You are already enrolled in "${item.course.title}"`,
      );
    }
  }

  const { subtotal, discount, total } = calculateCartTotals(
    cart.items.map((i) => i.course),
    cart.coupon,
  );

  if (total === 0) {
    const enrollments = await prisma.$transaction(async (tx) => {
      const created = [];

      for (const item of cart.items) {
        const enrollment = await tx.enrollment.create({
          data: {
            studentId: student.id,
            courseId: item.courseId,
          },
          include: { course: true },
        });

        await tx.payment.create({
          data: {
            amount: 0,
            status: PaymentStatus.SUCCEEDED,
            studentId: student.id,
            enrollmentId: enrollment.id,
          },
        });

        await tx.course.update({
          where: { id: item.courseId },
          data: { totalStudents: { increment: 1 } },
        });

        const instructor = await tx.instructor.findUnique({
          where: { id: item.course.instructorId },
          select: { userId: true },
        });

        if (instructor?.userId) {
          await tx.notification.create({
            data: {
              userId: instructor.userId,
              title: "New enrollment",
              message: `${student.name} enrolled in "${item.course.title}".`,
              type: NotificationType.ENROLLMENT,
            },
          });
        }

        created.push(enrollment);
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (cart.couponId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { couponId: null },
        });

        if (cart.coupon) {
          await incrementCouponUsage(tx, cart.couponId, cart.coupon.maxUsage);
        }
      }

      return created;
    });

    return { enrollments, paymentUrl: null };
  }

  const result = await prisma.$transaction(async (tx) => {
    const enrollmentIds: string[] = [];

    for (const item of cart.items) {
      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          courseId: item.courseId,
        },
        include: { course: true },
      });

      const price = item.course.discountPrice ?? item.course.price;
      const enrollmentDiscount = cart.coupon
        ? calculateItemDiscount(price, subtotal, discount)
        : 0;

      await tx.payment.create({
        data: {
          amount: price - enrollmentDiscount,
          studentId: student.id,
          enrollmentId: enrollment.id,
          couponId: cart.coupon?.id ?? null,
        },
      });

      enrollmentIds.push(enrollment.id);

      await tx.course.update({
        where: { id: item.courseId },
        data: { totalStudents: { increment: 1 } },
      });
    }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: cart.items.map((item) => {
        const price = item.course.discountPrice ?? item.course.price;
        const itemDiscount = cart.coupon
          ? calculateItemDiscount(price, subtotal, discount)
          : 0;
        const finalPrice = price - itemDiscount;
        return {
          price_data: {
            currency: "bdt",
            product_data: {
              name: item.course.title,
            },
            unit_amount: Math.round(finalPrice * 100),
          },
          quantity: item.quantity,
        };
      }),
      metadata: {
        studentId: student.id,
        enrollmentIds: enrollmentIds.join(","),
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/cart`,
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (cart.couponId) {
      await tx.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });

      if (cart.coupon) {
        await incrementCouponUsage(tx, cart.couponId, cart.coupon.maxUsage);
      }
    }

    return { enrollments: [], paymentUrl: session.url };
  });

  return result;
};

const getMyEnrollments = async (user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id, isDeleted: false },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          thumbnail: true,
          price: true,
          discountPrice: true,
          currency: true,
          level: true,
          totalLessons: true,
          instructor: {
            select: {
              name: true,
              profilePhoto: true,
            },
          },
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
      lessonProgress: {
        select: {
          id: true,
          isCompleted: true,
          lessonId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments;
};

const getSingleEnrollment = async (
  enrollmentId: string,
  user: IRequestUser,
) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      id: enrollmentId,
      studentId: student.id,
      isDeleted: false,
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                select: {
                  id: true,
                  title: true,
                  videoDuration: true,
                  order: true,
                  isFree: true,
                },
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      },
      lessonProgress: true,
    },
  });

  if (!enrollment) {
    throw new AppError(status.NOT_FOUND, "Enrollment not found");
  }

  if (
    enrollment.payment &&
    enrollment.payment.status !== PaymentStatus.SUCCEEDED
  ) {
    throw new AppError(
      status.FORBIDDEN,
      "Enrollment requires a successful payment",
    );
  }

  return enrollment;
};

const getAllEnrollments = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder(prisma.enrollment, query, {
    searchableFields: enrollmentSearchableFields,
    filterableFields: enrollmentFilterableFields,
  });

  const result = await queryBuilder
    .where({ isDeleted: false } as any)
    .search()
    .filter()
    .include({
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePhoto: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          price: true,
          thumbnail: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    } as any)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const cancelUnpaidEnrollments = async () => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const stalePayments = await prisma.payment.findMany({
    where: {
      status: {
        in: [PaymentStatus.PENDING, PaymentStatus.FAILED],
      },
      createdAt: { lte: thirtyMinutesAgo },
    },
    include: { enrollment: true },
  });

  if (stalePayments.length === 0) return;

  const enrollmentIds = stalePayments
    .map((p) => p.enrollment?.id)
    .filter(Boolean) as string[];
  const paymentIds = stalePayments.map((p) => p.id);

  await prisma.$transaction(async (tx) => {
    const couponIds = stalePayments
      .map((p) => p.couponId)
      .filter((id): id is string => Boolean(id));

    await tx.payment.updateMany({
      where: { id: { in: paymentIds } },
      data: {
        status: PaymentStatus.FAILED,
      },
    });

    await tx.enrollment.updateMany({
      where: { id: { in: enrollmentIds } },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    const staleCourseIds = stalePayments
      .map((p) => p.enrollment?.courseId)
      .filter(Boolean) as string[];

    for (const courseId of new Set(staleCourseIds)) {
      await tx.course.update({
        where: { id: courseId },
        data: { totalStudents: { decrement: 1 } },
      });
    }

    for (const couponId of couponIds) {
      await decrementCouponUsage(tx, couponId);
    }
  });
};

export const EnrollmentService = {
  checkoutCart,
  getMyEnrollments,
  getSingleEnrollment,
  getAllEnrollments,
  cancelUnpaidEnrollments,
};
