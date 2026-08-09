"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICreateInstructorPayload,
  IInstructor,
  IInstructorDetails,
  IUpdateInstructorPayload,
} from "@/types/instructor.types";

export const getInstructors = async (queryString?: string) => {
  try {
    const instructors = await httpClient.get<IInstructor[]>(
      `/instructors${queryString ? `?${queryString}` : ""}`,
    );
    return instructors;
  } catch (error) {
    console.log("Error fetching instructors:", error);
    throw error;
  }
};

export const getInstructorById = async (id: string) => {
  try {
    const instructor = await httpClient.get<IInstructorDetails>(
      `/instructors/${id}`,
    );
    return instructor;
  } catch (error) {
    console.log("Error fetching instructor details:", error);
    throw error;
  }
};

export const createInstructor = async (payload: ICreateInstructorPayload) => {
  try {
    const instructor = await httpClient.post<IInstructor>(
      "/users/create-instructor",
      payload,
    );
    return instructor;
  } catch (error) {
    console.log("Error creating instructor:", error);
    throw error;
  }
};

export const updateInstructor = async (
  id: string,
  payload: IUpdateInstructorPayload,
) => {
  try {
    const instructor = await httpClient.patch<IInstructor>(
      `/instructors/${id}`,
      payload,
    );
    return instructor;
  } catch (error) {
    console.log("Error updating instructor:", error);
    throw error;
  }
};

export const deleteInstructor = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(
      `/instructors/${id}`,
    );
    return result;
  } catch (error) {
    console.log("Error deleting instructor:", error);
    throw error;
  }
};
