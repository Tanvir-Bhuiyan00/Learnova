import { z } from "zod";

export const addToCartZodSchema = z.object({
  courseId: z.string(),
});

export const applyCouponZodSchema = z.object({
  code: z.string(),
});
