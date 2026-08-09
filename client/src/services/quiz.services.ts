"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IQuiz,
  ICreateQuizPayload,
  IUpdateQuizPayload,
  IQuizQuestion,
  IAddQuestionPayload,
  IUpdateQuestionPayload,
  IQuizAttempt,
  ISubmitAttemptPayload,
} from "@/types/quiz.types";

export const getQuizzesByCourse = async (courseId: string) => {
  try {
    const quizzes = await httpClient.get<IQuiz[]>(`/courses/${courseId}/quizzes`);
    return quizzes;
  } catch (error) {
    console.log("Error fetching quizzes:", error);
    throw error;
  }
};

export const getQuizById = async (courseId: string, quizId: string) => {
  try {
    const quiz = await httpClient.get<IQuiz>(
      `/courses/${courseId}/quizzes/${quizId}`,
    );
    return quiz;
  } catch (error) {
    console.log("Error fetching quiz details:", error);
    throw error;
  }
};

export const getQuizForTake = async (courseId: string, quizId: string) => {
  try {
    const quiz = await httpClient.get<IQuiz>(
      `/courses/${courseId}/quizzes/${quizId}/take`,
    );
    return quiz;
  } catch (error) {
    console.log("Error fetching quiz for take:", error);
    throw error;
  }
};

export const createQuiz = async (courseId: string, payload: ICreateQuizPayload) => {
  try {
    const quiz = await httpClient.post<IQuiz>(
      `/courses/${courseId}/quizzes`,
      payload,
    );
    return quiz;
  } catch (error) {
    console.log("Error creating quiz:", error);
    throw error;
  }
};

export const updateQuiz = async (
  courseId: string,
  quizId: string,
  payload: IUpdateQuizPayload,
) => {
  try {
    const quiz = await httpClient.patch<IQuiz>(
      `/courses/${courseId}/quizzes/${quizId}`,
      payload,
    );
    return quiz;
  } catch (error) {
    console.log("Error updating quiz:", error);
    throw error;
  }
};

export const deleteQuiz = async (courseId: string, quizId: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/courses/${courseId}/quizzes/${quizId}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting quiz:", error);
    throw error;
  }
};

export const getMyQuizAttempts = async (courseId: string, quizId: string) => {
  try {
    const attempts = await httpClient.get<IQuizAttempt[]>(
      `/courses/${courseId}/quizzes/${quizId}/attempts`,
    );
    return attempts;
  } catch (error) {
    console.log("Error fetching quiz attempts:", error);
    throw error;
  }
};

export const addQuestion = async (
  quizId: string,
  payload: IAddQuestionPayload,
) => {
  try {
    const question = await httpClient.post<IQuizQuestion>(
      `/quizzes/${quizId}/questions`,
      payload,
    );
    return question;
  } catch (error) {
    console.log("Error adding question:", error);
    throw error;
  }
};

export const updateQuestion = async (
  quizId: string,
  questionId: string,
  payload: IUpdateQuestionPayload,
) => {
  try {
    const question = await httpClient.patch<IQuizQuestion>(
      `/quizzes/${quizId}/questions/${questionId}`,
      payload,
    );
    return question;
  } catch (error) {
    console.log("Error updating question:", error);
    throw error;
  }
};

export const deleteQuestion = async (quizId: string, questionId: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/quizzes/${quizId}/questions/${questionId}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting question:", error);
    throw error;
  }
};

export const startAttempt = async (quizId: string) => {
  try {
    const attempt = await httpClient.post<IQuizAttempt>(
      `/quizzes/${quizId}/attempt`,
      {},
    );
    return attempt;
  } catch (error) {
    console.log("Error starting quiz attempt:", error);
    throw error;
  }
};

export const getAttemptDetail = async (attemptId: string) => {
  try {
    const attempt = await httpClient.get<IQuizAttempt>(
      `/quiz-attempts/${attemptId}`,
    );
    return attempt;
  } catch (error) {
    console.log("Error fetching attempt details:", error);
    throw error;
  }
};

export const submitAttempt = async (
  attemptId: string,
  payload: ISubmitAttemptPayload,
) => {
  try {
    const attempt = await httpClient.post<IQuizAttempt>(
      `/quiz-attempts/${attemptId}/submit`,
      payload,
    );
    return attempt;
  } catch (error) {
    console.log("Error submitting attempt:", error);
    throw error;
  }
};
