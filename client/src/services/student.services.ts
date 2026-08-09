"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IStudent,
  IUpdateStudentPayload,
} from "@/types/student.types";

export const getMyStudentProfile = async () => {
  try {
    const student = await httpClient.get<IStudent>("/students/my-profile");
    return student;
  } catch (error) {
    console.log("Error fetching student profile:", error);
    throw error;
  }
};

export const updateMyStudentProfile = async (payload: IUpdateStudentPayload) => {
  try {
    const student = await httpClient.patch<IStudent>(
      "/students/my-profile",
      payload,
    );
    return student;
  } catch (error) {
    console.log("Error updating student profile:", error);
    throw error;
  }
};

export const deleteMyAccount = async () => {
  try {
    const result = await httpClient.delete<{ message: string }>("/students/me");
    return result;
  } catch (error) {
    console.log("Error deleting account:", error);
    throw error;
  }
};

export const getStudents = async (queryString?: string) => {
  try {
    const students = await httpClient.get<IStudent[]>(
      `/students${queryString ? `?${queryString}` : ""}`,
    );
    return students;
  } catch (error) {
    console.log("Error fetching students:", error);
    throw error;
  }
};

export const getStudentById = async (id: string) => {
  try {
    const student = await httpClient.get<IStudent>(`/students/${id}`);
    return student;
  } catch (error) {
    console.log("Error fetching student details:", error);
    throw error;
  }
};

export const updateStudent = async (id: string, payload: IUpdateStudentPayload) => {
  try {
    const student = await httpClient.patch<IStudent>(`/students/${id}`, payload);
    return student;
  } catch (error) {
    console.log("Error updating student:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/students/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting student:", error);
    throw error;
  }
};
