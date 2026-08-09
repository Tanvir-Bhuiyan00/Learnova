import { z } from "zod";

export const createReviewZodSchema = z.object({
  courseId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export const updateReviewZodSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(1).optional(),
});
