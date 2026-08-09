import { z } from "zod";

export const createCategoryZodSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const updateCategoryZodSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});
