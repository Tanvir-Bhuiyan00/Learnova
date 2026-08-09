import { z } from "zod";

const createDiscussionZodSchema = z.object({
  courseId: z.string("Course ID is required"),
  title: z
    .string("Title is required")
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  content: z
    .string("Content is required")
    .min(1, "Content cannot be empty"),
});

const updateDiscussionZodSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  content: z.string().min(1, "Content cannot be empty").optional(),
});

const createReplyZodSchema = z.object({
  content: z
    .string("Content is required")
    .min(1, "Content cannot be empty"),
  parentId: z.string().optional(),
});

export const DiscussionValidation = {
  createDiscussionZodSchema,
  updateDiscussionZodSchema,
  createReplyZodSchema,
};
