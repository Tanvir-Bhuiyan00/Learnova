import z from "zod";
import { CourseLevel, CourseStatus } from "../../../generated/prisma/enums";

const courseLevelValues = Object.values(CourseLevel) as [string, ...string[]];
const courseStatusValues = Object.values(CourseStatus) as [string, ...string[]];

export const createCourseZodSchema = z.object({
  title: z
    .string("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string("Description must be a string").optional(),
  price: z
    .number("Price must be a number")
    .nonnegative("Price cannot be negative")
    .default(0)
    .optional(),
  discountPrice: z
    .number("Discount price must be a number")
    .nonnegative("Discount price cannot be negative")
    .optional(),
  currency: z
    .string("Currency must be a string")
    .max(3, "Currency must be at most 3 characters")
    .default("BDT")
    .optional(),
  level: z.enum(courseLevelValues).default(CourseLevel.BEGINNER).optional(),
  language: z
    .string("Language must be a string")
    .max(50, "Language must be at most 50 characters")
    .default("English")
    .optional(),
  categoryId: z.string("Category ID is required"),
});

export const updateCourseZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z.string("Description must be a string").optional(),
  thumbnail: z.string("Thumbnail must be a string").optional(),
  price: z
    .number("Price must be a number")
    .nonnegative("Price cannot be negative")
    .optional(),
  discountPrice: z
    .number("Discount price must be a number")
    .nonnegative("Discount price cannot be negative")
    .optional(),
  currency: z
    .string("Currency must be a string")
    .max(3, "Currency must be at most 3 characters")
    .optional(),
  level: z.enum(courseLevelValues).optional(),
  language: z
    .string("Language must be a string")
    .max(50, "Language must be at most 50 characters")
    .optional(),
  categoryId: z.string("Category ID must be a string").optional(),
  status: z.enum(courseStatusValues).optional(),
});

export const createModuleZodSchema = z.object({
  title: z
    .string("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string("Description must be a string").optional(),
  order: z
    .number("Order is required")
    .int("Order must be an integer")
    .nonnegative("Order cannot be negative"),
});

export const updateModuleZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z.string("Description must be a string").optional(),
  order: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .nonnegative("Order cannot be negative")
    .optional(),
});

export const createLessonZodSchema = z.object({
  title: z
    .string("Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z.string("Description must be a string").optional(),
  videoUrl: z
    .string("Video URL must be a string")
    .max(500, "Video URL must be at most 500 characters")
    .optional(),
  videoDuration: z
    .number("Video duration must be a number")
    .int("Video duration must be an integer")
    .nonnegative("Video duration cannot be negative")
    .optional(),
  content: z.string("Content must be a string").optional(),
  order: z
    .number("Order is required")
    .int("Order must be an integer")
    .nonnegative("Order cannot be negative"),
  isFree: z.boolean("isFree must be a boolean").default(false).optional(),
});

export const updateLessonZodSchema = z.object({
  title: z
    .string("Title must be a string")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters")
    .optional(),
  description: z.string("Description must be a string").optional(),
  videoUrl: z
    .string("Video URL must be a string")
    .max(500, "Video URL must be at most 500 characters")
    .optional(),
  videoDuration: z
    .number("Video duration must be a number")
    .int("Video duration must be an integer")
    .nonnegative("Video duration cannot be negative")
    .optional(),
  content: z.string("Content must be a string").optional(),
  order: z
    .number("Order must be a number")
    .int("Order must be an integer")
    .nonnegative("Order cannot be negative")
    .optional(),
  isFree: z.boolean("isFree must be a boolean").optional(),
});
