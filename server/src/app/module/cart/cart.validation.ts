import z from "zod";

export const addToCartZodSchema = z.object({
  courseId: z.string("Course ID is required"),
});

export const applyCouponZodSchema = z.object({
  code: z.string("Coupon code is required"),
});
