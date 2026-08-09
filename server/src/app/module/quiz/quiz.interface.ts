import { QuestionType, QuizCategory } from "../../../generated/prisma/enums";

export interface ICreateQuizPayload {
  title: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
  category: QuizCategory;
}

export interface IUpdateQuizPayload {
  title?: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
  category?: QuizCategory;
}

export interface IAddQuestionPayload {
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
  order: number;
}

export interface IUpdateQuestionPayload {
  question?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  order?: number;
}

export interface ISubmitAnswer {
  questionId: string;
  selectedAnswer: string;
}

export interface ISubmitAttemptPayload {
  answers: ISubmitAnswer[];
}
