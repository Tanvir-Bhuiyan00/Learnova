import status from "http-status";
import { QuestionType } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import {
  assertCourseOwnership,
  assertQuestionOwnership,
  assertQuizOwnership,
} from "../../utils/ownership";
import {
  IAddQuestionPayload,
  ICreateQuizPayload,
  ISubmitAttemptPayload,
  IUpdateQuestionPayload,
  IUpdateQuizPayload,
} from "./quiz.interface";

const createQuiz = async (
  courseId: string,
  payload: ICreateQuizPayload,
  user: IRequestUser,
) => {
  await assertCourseOwnership(user, courseId);

  const course = await prisma.course.findUnique({
    where: { id: courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: payload.title,
      description: payload.description,
      passingScore: payload.passingScore ?? 80,
      maxAttempts: payload.maxAttempts ?? 1,
      timeLimit: payload.timeLimit,
      category: payload.category,
      courseId,
    },
  });

  return quiz;
};

const getQuizzesByCourse = async (courseId: string, user: IRequestUser) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId, isDeleted: false },
  });

  if (!course) {
    throw new AppError(status.NOT_FOUND, "Course not found");
  }

  const isStudent = user.role === "STUDENT";

  const quizzes = await prisma.quiz.findMany({
    where: { courseId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { questions: true } },
      questions: isStudent
        ? false
        : {
            where: { isDeleted: false },
            orderBy: { order: "asc" },
            select: {
              id: true,
              question: true,
              questionType: true,
              options: true,
              correctAnswer: true,
              order: true,
            },
          },
    },
  });

  if (isStudent) {
    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
    });

    if (student) {
      const quizzesWithAttempts = await Promise.all(
        quizzes.map(async (quiz) => {
          const attemptCount = await prisma.quizAttempt.count({
            where: {
              quizId: quiz.id,
              studentId: student.id,
              isDeleted: false,
            },
          });

          return { ...quiz, myAttemptCount: attemptCount };
        }),
      );

      return quizzesWithAttempts;
    }
  }

  return quizzes;
};

const getQuizById = async (quizId: string, user: IRequestUser) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDeleted: false },
    include: {
      _count: { select: { questions: true } },
      questions: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  if (user.role === "STUDENT") {
    const safeQuestions = quiz.questions.map((q) => ({
      id: q.id,
      question: q.question,
      questionType: q.questionType,
      options: q.options,
      order: q.order,
    }));

    return { ...quiz, questions: safeQuestions };
  }

  return quiz;
};

const getQuizForTaking = async (quizId: string, user: IRequestUser) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDeleted: false },
    include: {
      course: { select: { id: true } },
      questions: {
        where: { isDeleted: false },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      courseId: quiz.courseId,
      isDeleted: false,
    },
  });

  if (!enrollment) {
    throw new AppError(
      status.FORBIDDEN,
      "You must be enrolled in the course to take this quiz",
    );
  }

  const previousAttempts = await prisma.quizAttempt.findMany({
    where: {
      quizId,
      studentId: student.id,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      isPassed: true,
      startedAt: true,
      completedAt: true,
    },
  });

  const safeQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    questionType: q.questionType,
    options: q.options,
    order: q.order,
  }));

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    maxAttempts: quiz.maxAttempts,
    timeLimit: quiz.timeLimit,
    category: quiz.category,
    questions: safeQuestions,
    previousAttempts,
    remainingAttempts: Math.max(
      0,
      quiz.maxAttempts - previousAttempts.length,
    ),
  };
};

const updateQuiz = async (
  id: string,
  payload: IUpdateQuizPayload,
  user: IRequestUser,
) => {
  await assertQuizOwnership(user, id);

  const isQuizExist = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!isQuizExist) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const quiz = await prisma.quiz.update({
    where: { id },
    data: payload,
  });

  return quiz;
};

const deleteQuiz = async (id: string, user: IRequestUser) => {
  await assertQuizOwnership(user, id);

  const isQuizExist = await prisma.quiz.findUnique({
    where: { id },
  });

  if (!isQuizExist) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return quiz;
};

const addQuestion = async (
  quizId: string,
  payload: IAddQuestionPayload,
  user: IRequestUser,
) => {
  await assertQuizOwnership(user, quizId);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDeleted: false },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const existingQuestion = await prisma.quizQuestion.findUnique({
    where: {
      quizId_order: { quizId, order: payload.order },
    },
  });

  if (existingQuestion) {
    throw new AppError(
      status.CONFLICT,
      `A question with order ${payload.order} already exists in this quiz`,
    );
  }

  const question = await prisma.quizQuestion.create({
    data: {
      question: payload.question,
      questionType: payload.questionType,
      options: JSON.parse(JSON.stringify(payload.options)),
      correctAnswer: payload.correctAnswer,
      order: payload.order,
      quizId,
    },
  });

  return question;
};

const updateQuestion = async (
  id: string,
  payload: IUpdateQuestionPayload,
  user: IRequestUser,
) => {
  await assertQuestionOwnership(user, id);

  const isQuestionExist = await prisma.quizQuestion.findUnique({
    where: { id },
  });

  if (!isQuestionExist) {
    throw new AppError(status.NOT_FOUND, "Question not found");
  }

  const data: Record<string, unknown> = {};

  if (payload.question !== undefined) data.question = payload.question;
  if (payload.questionType !== undefined) data.questionType = payload.questionType;
  if (payload.options !== undefined)
    data.options = JSON.parse(JSON.stringify(payload.options));
  if (payload.correctAnswer !== undefined)
    data.correctAnswer = payload.correctAnswer;
  if (payload.order !== undefined) data.order = payload.order;

  if (payload.order && payload.order !== isQuestionExist.order) {
    const duplicate = await prisma.quizQuestion.findUnique({
      where: {
        quizId_order: {
          quizId: isQuestionExist.quizId,
          order: payload.order,
        },
      },
    });

    if (duplicate) {
      throw new AppError(
        status.CONFLICT,
        `A question with order ${payload.order} already exists in this quiz`,
      );
    }
  }

  const question = await prisma.quizQuestion.update({
    where: { id },
    data,
  });

  return question;
};

const deleteQuestion = async (id: string, user: IRequestUser) => {
  await assertQuestionOwnership(user, id);

  const isQuestionExist = await prisma.quizQuestion.findUnique({
    where: { id },
  });

  if (!isQuestionExist) {
    throw new AppError(status.NOT_FOUND, "Question not found");
  }

  const question = await prisma.quizQuestion.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return question;
};

const startAttempt = async (quizId: string, user: IRequestUser) => {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDeleted: false },
    include: { course: true },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      courseId: quiz.courseId,
      isDeleted: false,
    },
  });

  if (!enrollment) {
    throw new AppError(
      status.FORBIDDEN,
      "You must be enrolled in the course to take this quiz",
    );
  }

  const existingAttempts = await prisma.quizAttempt.count({
    where: {
      quizId,
      studentId: student.id,
      isDeleted: false,
    },
  });

  if (existingAttempts >= quiz.maxAttempts) {
    throw new AppError(
      status.BAD_REQUEST,
      `You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz`,
    );
  }

  const incompleteAttempt = await prisma.quizAttempt.findFirst({
    where: {
      quizId,
      studentId: student.id,
      completedAt: null,
      isDeleted: false,
    },
  });

  if (incompleteAttempt) {
    return incompleteAttempt;
  }

  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId: student.id,
      quizId,
      startedAt: new Date(),
    },
  });

  return attempt;
};

const submitAttempt = async (
  attemptId: string,
  payload: ISubmitAttemptPayload,
  user: IRequestUser,
) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            where: { isDeleted: false },
          },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError(status.NOT_FOUND, "Attempt not found");
  }

  if (attempt.studentId !== student.id) {
    throw new AppError(status.FORBIDDEN, "This attempt does not belong to you");
  }

  if (attempt.completedAt) {
    throw new AppError(
      status.BAD_REQUEST,
      "This attempt has already been submitted",
    );
  }

  const questions = attempt.quiz.questions;
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "This quiz has no questions to grade",
    );
  }

  const answerRecords = payload.answers.map((submitted) => {
    const question = questions.find((q) => q.id === submitted.questionId);

    if (!question) {
      throw new AppError(
        status.BAD_REQUEST,
        `Question with id ${submitted.questionId} not found in this quiz`,
      );
    }

    let isCorrect = false;

    if (
      question.questionType === QuestionType.MULTIPLE_CHOICE ||
      question.questionType === QuestionType.TRUE_FALSE
    ) {
      isCorrect =
        submitted.selectedAnswer.trim().toLowerCase() ===
        question.correctAnswer.trim().toLowerCase();
    }

    return {
      selectedAnswer: submitted.selectedAnswer,
      isCorrect,
      questionId: question.id,
      attemptId: attempt.id,
    };
  });

  const correctCount = answerRecords.filter((a) => a.isCorrect).length;
  const score = totalQuestions > 0
    ? Number(((correctCount / totalQuestions) * 100).toFixed(2))
    : 0;
  const isPassed = score >= attempt.quiz.passingScore;

  const result = await prisma.$transaction(async (tx) => {
    await tx.quizAnswer.createMany({
      data: answerRecords,
    });

    const updatedAttempt = await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        isPassed,
        completedAt: new Date(),
      },
      include: {
        answers: {
          include: {
            question: {
              select: {
                id: true,
                question: true,
                questionType: true,
                options: true,
                correctAnswer: true,
              },
            },
          },
        },
      },
    });

    return updatedAttempt;
  });

  return {
    id: result.id,
    score: result.score,
    isPassed: result.isPassed,
    startedAt: result.startedAt,
    completedAt: result.completedAt,
    totalQuestions,
    correctCount,
    answers: result.answers.map((a) => ({
      questionId: a.questionId,
      question: a.question.question,
      questionType: a.question.questionType,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
    })),
  };
};

const getMyAttempts = async (quizId: string, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId, isDeleted: false },
  });

  if (!quiz) {
    throw new AppError(status.NOT_FOUND, "Quiz not found");
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      quizId,
      studentId: student.id,
      isDeleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      score: true,
      isPassed: true,
      startedAt: true,
      completedAt: true,
    },
  });

  return attempts;
};

const getAttemptDetail = async (attemptId: string, user: IRequestUser) => {
  const student = await prisma.student.findUnique({
    where: { userId: user.userId },
  });

  if (!student) {
    throw new AppError(status.NOT_FOUND, "Student profile not found");
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          passingScore: true,
          maxAttempts: true,
        },
      },
      answers: {
        include: {
          question: {
            select: {
              id: true,
              question: true,
              questionType: true,
              options: true,
              correctAnswer: true,
              order: true,
            },
          },
        },
        orderBy: {
          question: { order: "asc" },
        },
      },
    },
  });

  if (!attempt) {
    throw new AppError(status.NOT_FOUND, "Attempt not found");
  }

  if (attempt.studentId !== student.id) {
    throw new AppError(status.FORBIDDEN, "This attempt does not belong to you");
  }

  return {
    id: attempt.id,
    score: attempt.score,
    isPassed: attempt.isPassed,
    startedAt: attempt.startedAt,
    completedAt: attempt.completedAt,
    quiz: attempt.quiz,
    answers: attempt.answers.map((a) => ({
      questionId: a.questionId,
      question: a.question.question,
      questionType: a.question.questionType,
      options: a.question.options,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.question.correctAnswer,
      isCorrect: a.isCorrect,
    })),
  };
};

export const QuizService = {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  getQuizForTaking,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  startAttempt,
  submitAttempt,
  getMyAttempts,
  getAttemptDetail,
};
