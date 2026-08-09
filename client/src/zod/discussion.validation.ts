import { z } from "zod";

export const createDiscussionZodSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
});

export const updateDiscussionZodSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
});

export const createReplyZodSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});
