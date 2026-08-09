import { QuestionType, QuizCategory } from "../../../generated/prisma/enums";
import z from "zod";

export const createQuizZodSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  passingScore: z
    .number()
    .min(0)
    .max(100)
    .default(80)
    .optional(),
  maxAttempts: z.number().int().min(1).default(1).optional(),
  timeLimit: z.number().int().min(1).optional(),
  category: z.nativeEnum(QuizCategory),
});

export const updateQuizZodSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  maxAttempts: z.number().int().min(1).optional(),
  timeLimit: z.number().int().min(1).optional(),
  category: z.nativeEnum(QuizCategory).optional(),
});

export const addQuestionZodSchema = z.object({
  question: z.string().min(1, "Question is required"),
  questionType: z.nativeEnum(QuestionType),
  options: z.array(z.string()).min(1, "At least one option is required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
  order: z.number().int().min(1),
});

export const updateQuestionZodSchema = z.object({
  question: z.string().min(1).optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
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
    .nonempty("At least one answer is required"),
});
