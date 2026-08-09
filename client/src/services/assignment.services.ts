"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IAssignment,
  ICreateAssignmentPayload,
  IUpdateAssignmentPayload,
  IAssignmentSubmission,
  IGradeSubmissionPayload,
} from "@/types/assignment.types";

export const getAssignments = async (courseId?: string) => {
  try {
    const queryString = courseId ? `?courseId=${courseId}` : "";
    const assignments = await httpClient.get<IAssignment[]>(
      `/assignments${queryString}`,
    );
    return assignments;
  } catch (error) {
    console.log("Error fetching assignments:", error);
    throw error;
  }
};

export const getAssignmentById = async (id: string) => {
  try {
    const assignment = await httpClient.get<IAssignment>(`/assignments/${id}`);
    return assignment;
  } catch (error) {
    console.log("Error fetching assignment details:", error);
    throw error;
  }
};

export const createAssignment = async (payload: ICreateAssignmentPayload) => {
  try {
    const assignment = await httpClient.post<IAssignment>("/assignments", payload);
    return assignment;
  } catch (error) {
    console.log("Error creating assignment:", error);
    throw error;
  }
};

export const updateAssignment = async (id: string, payload: IUpdateAssignmentPayload) => {
  try {
    const assignment = await httpClient.patch<IAssignment>(`/assignments/${id}`, payload);
    return assignment;
  } catch (error) {
    console.log("Error updating assignment:", error);
    throw error;
  }
};

export const deleteAssignment = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/assignments/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting assignment:", error);
    throw error;
  }
};

export const submitAssignment = async (id: string, formData: FormData) => {
  try {
    const submission = await httpClient.post<IAssignmentSubmission>(
      `/assignments/${id}/submit`,
      formData,
    );
    return submission;
  } catch (error) {
    console.log("Error submitting assignment:", error);
    throw error;
  }
};

export const getSubmissions = async (assignmentId: string) => {
  try {
    const submissions = await httpClient.get<IAssignmentSubmission[]>(
      `/assignments/${assignmentId}/submissions`,
    );
    return submissions;
  } catch (error) {
    console.log("Error fetching submissions:", error);
    throw error;
  }
};

export const gradeSubmission = async (
  submissionId: string,
  payload: IGradeSubmissionPayload,
) => {
  try {
    const submission = await httpClient.patch<IAssignmentSubmission>(
      `/assignments/submissions/${submissionId}/grade`,
      payload,
    );
    return submission;
  } catch (error) {
    console.log("Error grading submission:", error);
    throw error;
  }
};
