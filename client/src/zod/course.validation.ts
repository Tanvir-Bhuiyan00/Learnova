import { z } from "zod";

export const createCourseZodSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  price: z.number().nonnegative().default(0).optional(),
  discountPrice: z.number().nonnegative().optional(),
  currency: z.string().max(3).default("BDT").optional(),
  level: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"])
    .default("BEGINNER")
    .optional(),
  language: z.string().max(50).default("English").optional(),
  categoryId: z.string(),
});

export const updateCourseZodSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  price: z.number().nonnegative().optional(),
  discountPrice: z.number().nonnegative().optional(),
  currency: z.string().max(3).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  language: z.string().max(50).optional(),
  categoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const createModuleZodSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  order: z.number().int().nonnegative(),
});

export const updateModuleZodSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
});

export const createLessonZodSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  videoUrl: z.string().max(500).optional(),
  videoDuration: z.number().int().nonnegative().optional(),
  content: z.string().optional(),
  order: z.number().int().nonnegative(),
  isFree: z.boolean().default(false).optional(),
});

export const updateLessonZodSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().optional(),
  videoUrl: z.string().max(500).optional(),
  videoDuration: z.number().int().nonnegative().optional(),
  content: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
  isFree: z.boolean().optional(),
});
