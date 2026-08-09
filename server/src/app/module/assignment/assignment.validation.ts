import { z } from "zod";

const createAssignmentZodSchema = z.object({
  courseId: z.string("Course ID is required"),
  title: z
    .string("Title is required")
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  totalMarks: z
    .number("Total marks is required")
    .positive("Total marks must be positive"),
});

const updateAssignmentZodSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters")
    .optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  totalMarks: z.number().positive("Total marks must be positive").optional(),
});

const gradeSubmissionZodSchema = z.object({
  marks: z
    .number("Marks are required")
    .nonnegative("Marks cannot be negative"),
  feedback: z.string().optional(),
});

export const AssignmentValidation = {
  createAssignmentZodSchema,
  updateAssignmentZodSchema,
  gradeSubmissionZodSchema,
};
