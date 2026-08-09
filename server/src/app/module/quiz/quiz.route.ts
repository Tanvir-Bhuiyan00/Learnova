import { Router } from "express";
import { UserRole } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { QuizController } from "./quiz.controller";
import {
  addQuestionZodSchema,
  createQuizZodSchema,
  submitAttemptZodSchema,
  updateQuestionZodSchema,
  updateQuizZodSchema,
} from "./quiz.validation";

// ─── Router for course-nested quiz routes (mounted at /courses) ───
const courseQuizRouter = Router();

courseQuizRouter.post(
  "/:courseId/quizzes",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(createQuizZodSchema),
  QuizController.createQuiz,
);

courseQuizRouter.get(
  "/:courseId/quizzes",
  checkAuth(
    UserRole.STUDENT,
    UserRole.INSTRUCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  QuizController.getQuizzesByCourse,
);

courseQuizRouter.get(
  "/:courseId/quizzes/:quizId",
  checkAuth(
    UserRole.STUDENT,
    UserRole.INSTRUCTOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  QuizController.getQuizById,
);

courseQuizRouter.get(
  "/:courseId/quizzes/:quizId/take",
  checkAuth(UserRole.STUDENT),
  QuizController.getQuizForTaking,
);

courseQuizRouter.patch(
  "/:courseId/quizzes/:quizId",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateQuizZodSchema),
  QuizController.updateQuiz,
);

courseQuizRouter.delete(
  "/:courseId/quizzes/:quizId",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  QuizController.deleteQuiz,
);

courseQuizRouter.get(
  "/:courseId/quizzes/:quizId/attempts",
  checkAuth(UserRole.STUDENT),
  QuizController.getMyAttempts,
);

// ─── Router for standalone quiz routes (mounted at /quizzes) ───
const quizRouter = Router();

quizRouter.post(
  "/:quizId/questions",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(addQuestionZodSchema),
  QuizController.addQuestion,
);

quizRouter.patch(
  "/:quizId/questions/:questionId",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validateRequest(updateQuestionZodSchema),
  QuizController.updateQuestion,
);

quizRouter.delete(
  "/:quizId/questions/:questionId",
  checkAuth(UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  QuizController.deleteQuestion,
);

quizRouter.post(
  "/:quizId/attempt",
  checkAuth(UserRole.STUDENT),
  QuizController.startAttempt,
);

// ─── Router for attempt routes (mounted at /quiz-attempts) ───
const attemptRouter = Router();

attemptRouter.get(
  "/:attemptId",
  checkAuth(UserRole.STUDENT),
  QuizController.getAttemptDetail,
);

attemptRouter.post(
  "/:attemptId/submit",
  checkAuth(UserRole.STUDENT),
  validateRequest(submitAttemptZodSchema),
  QuizController.submitAttempt,
);

export { courseQuizRouter as CourseQuizRoutes, quizRouter as QuizRoutes, attemptRouter as AttemptRoutes };
