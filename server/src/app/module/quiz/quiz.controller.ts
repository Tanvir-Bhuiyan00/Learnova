import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { QuizService } from "./quiz.service";

const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await QuizService.createQuiz(courseId, req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Quiz created successfully",
    data: result,
  });
});

const getQuizzesByCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const result = await QuizService.getQuizzesByCourse(courseId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quizzes fetched successfully",
    data: result,
  });
});

const getQuizById = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const quizId = req.params.quizId as string;
  const result = await QuizService.getQuizById(courseId, quizId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quiz fetched successfully",
    data: result,
  });
});

const getQuizForTaking = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.getQuizForTaking(quizId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quiz data retrieved successfully",
    data: result,
  });
});

const updateQuiz = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.updateQuiz(quizId, req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quiz updated successfully",
    data: result,
  });
});

const deleteQuiz = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.deleteQuiz(quizId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Quiz deleted successfully",
    data: result,
  });
});

const addQuestion = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.addQuestion(quizId, req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Question added successfully",
    data: result,
  });
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  const questionId = req.params.questionId as string;
  const result = await QuizService.updateQuestion(questionId, req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Question updated successfully",
    data: result,
  });
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const questionId = req.params.questionId as string;
  const result = await QuizService.deleteQuestion(questionId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Question deleted successfully",
    data: result,
  });
});

const startAttempt = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.startAttempt(quizId, req.user);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Attempt started successfully",
    data: result,
  });
});

const submitAttempt = catchAsync(async (req: Request, res: Response) => {
  const attemptId = req.params.attemptId as string;
  const result = await QuizService.submitAttempt(attemptId, req.body, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Attempt submitted successfully",
    data: result,
  });
});

const getMyAttempts = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId as string;
  const result = await QuizService.getMyAttempts(quizId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Attempts fetched successfully",
    data: result,
  });
});

const getAttemptDetail = catchAsync(async (req: Request, res: Response) => {
  const attemptId = req.params.attemptId as string;
  const result = await QuizService.getAttemptDetail(attemptId, req.user);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Attempt detail fetched successfully",
    data: result,
  });
});

export const QuizController = {
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
