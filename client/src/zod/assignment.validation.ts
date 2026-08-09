import { z } from "zod";

export const createAssignmentZodSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  totalMarks: z.number().positive(),
});

export const updateAssignmentZodSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  totalMarks: z.number().positive().optional(),
});

export const gradeSubmissionZodSchema = z.object({
  marks: z.number().nonnegative(),
  feedback: z.string().optional(),
});
