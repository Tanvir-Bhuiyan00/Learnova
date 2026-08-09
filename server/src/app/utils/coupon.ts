import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../errorHelpers/AppError";

interface CouponState {
  isDeleted: boolean;
  isActive: boolean;
  expiresAt: Date | null;
  maxUsage: number | null;
  usedCount: number;
}

export const assertCouponValid = (coupon: CouponState) => {
  if (coupon.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Coupon not found");
  }

  if (!coupon.isActive) {
    throw new AppError(status.BAD_REQUEST, "Coupon is no longer active");
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError(status.BAD_REQUEST, "Coupon has expired");
  }

  if (coupon.maxUsage && coupon.usedCount >= coupon.maxUsage) {
    throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
  }
};

export const incrementCouponUsage = async (
  tx: Prisma.TransactionClient,
  couponId: string,
  maxUsage: number | null,
) => {
  if (maxUsage) {
    const updated = await tx.coupon.updateMany({
      where: { id: couponId, usedCount: { lt: maxUsage } },
      data: { usedCount: { increment: 1 } },
    });

    if (updated.count === 0) {
      throw new AppError(status.BAD_REQUEST, "Coupon usage limit reached");
    }

    return;
  }

  await tx.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
};

export const decrementCouponUsage = async (
  tx: Prisma.TransactionClient,
  couponId: string,
) => {
  await tx.coupon.update({
    where: { id: couponId },
    data: { usedCount: { decrement: 1 } },
  });
};
