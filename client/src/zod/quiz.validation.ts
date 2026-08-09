import { z } from "zod";

export const createQuizZodSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(80).optional(),
  maxAttempts: z.number().int().min(1).default(1).optional(),
  timeLimit: z.number().int().min(1).optional(),
  category: z.enum(["MCQ", "TRUE_FALSE", "SHORT_QUESTION"]),
});

export const updateQuizZodSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(1).optional(),
  category: z.enum(["MCQ", "TRUE_FALSE", "SHORT_QUESTION"]).optional(),
});

export const addQuestionZodSchema = z.object({
  question: z.string().min(1),
  questionType: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z.array(z.string()).min(1),
  correctAnswer: z.string().min(1),
  order: z.number().int().min(1),
});

export const updateQuestionZodSchema = z.object({
  question: z.string().min(1).optional(),
  questionType: z
    .enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"])
    .optional(),
  options: z.array(z.string()).min(1).optional(),
  correctAnswer: z.string().min(1).optional(),
  order: z.number().int().min(1).optional(),
});

export const submitAttemptZodSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selectedAnswer: z.string(),
      }),
    )
    .nonempty(),
});
