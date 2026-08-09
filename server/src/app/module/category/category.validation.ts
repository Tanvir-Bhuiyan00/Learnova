import z from "zod";

export const createCategoryZodSchema = z.object({
  title: z.string("Title is required").min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters"),
  description: z.string("Description must be a string").optional(),
  icon: z.string("Icon must be a string").optional(),
});

export const updateCategoryZodSchema = z.object({
  title: z.string("Title must be a string").min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters").optional(),
  description: z.string("Description must be a string").optional(),
  icon: z.string("Icon must be a string").optional(),
});
