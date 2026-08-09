export interface IQuiz {
  id: string;
  title: string;
  description?: string | null;
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number | null;
  category: "MCQ" | "TRUE_FALSE" | "SHORT_QUESTION";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  courseId: string;
}

export interface ICreateQuizPayload {
  title: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
  category: "MCQ" | "TRUE_FALSE" | "SHORT_QUESTION";
}

export interface IUpdateQuizPayload {
  title?: string;
  description?: string;
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
  category?: "MCQ" | "TRUE_FALSE" | "SHORT_QUESTION";
}

export interface IQuizQuestion {
  id: string;
  question: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[];
  correctAnswer: string;
  order: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  quizId: string;
}

export interface IAddQuestionPayload {
  question: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options: string[];
  correctAnswer: string;
  order: number;
}

export interface IUpdateQuestionPayload {
  question?: string;
  questionType?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
  options?: string[];
  correctAnswer?: string;
  order?: number;
}

export interface IQuizAttempt {
  id: string;
  score?: number | null;
  isPassed: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  startedAt: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  quizId: string;
}

export interface IQuizAnswer {
  id: string;
  selectedAnswer: string;
  isCorrect: boolean;
  createdAt: string;
  updatedAt: string;
  attemptId: string;
  questionId: string;
}

export interface ISubmitAnswer {
  questionId: string;
  selectedAnswer: string;
}

export interface ISubmitAttemptPayload {
  answers: ISubmitAnswer[];
}
