"use server";

import { httpClient } from "@/lib/axios/httpClient";
import { IEnrollment } from "@/types/enrollment.types";

export const checkout = async () => {
  try {
    const result = await httpClient.post<IEnrollment>("/enrollments/checkout", {});
    return result;
  } catch (error) {
    console.log("Error during checkout:", error);
    throw error;
  }
};

export const getMyEnrollments = async () => {
  try {
    const enrollments = await httpClient.get<IEnrollment[]>("/enrollments/my-enrollments");
    return enrollments;
  } catch (error) {
    console.log("Error fetching my enrollments:", error);
    throw error;
  }
};

export const getMyEnrollmentById = async (id: string) => {
  try {
    const enrollment = await httpClient.get<IEnrollment>(`/enrollments/my-enrollments/${id}`);
    return enrollment;
  } catch (error) {
    console.log("Error fetching enrollment details:", error);
    throw error;
  }
};

export const getAllEnrollments = async (queryString?: string) => {
  try {
    const enrollments = await httpClient.get<IEnrollment[]>(
      `/enrollments${queryString ? `?${queryString}` : ""}`,
    );
    return enrollments;
  } catch (error) {
    console.log("Error fetching enrollments:", error);
    throw error;
  }
};
