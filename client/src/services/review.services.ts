"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  IReview,
  ICreateReviewPayload,
  IUpdateReviewPayload,
} from "@/types/review.types";

export const getReviews = async (queryString?: string) => {
  try {
    const reviews = await httpClient.get<IReview[]>(
      `/reviews${queryString ? `?${queryString}` : ""}`,
    );
    return reviews;
  } catch (error) {
    console.log("Error fetching reviews:", error);
    throw error;
  }
};

export const getMyReviews = async () => {
  try {
    const reviews = await httpClient.get<IReview[]>("/reviews/my-reviews");
    return reviews;
  } catch (error) {
    console.log("Error fetching my reviews:", error);
    throw error;
  }
};

export const createReview = async (payload: ICreateReviewPayload) => {
  try {
    const review = await httpClient.post<IReview>("/reviews", payload);
    return review;
  } catch (error) {
    console.log("Error creating review:", error);
    throw error;
  }
};

export const updateReview = async (id: string, payload: IUpdateReviewPayload) => {
  try {
    const review = await httpClient.patch<IReview>(`/reviews/${id}`, payload);
    return review;
  } catch (error) {
    console.log("Error updating review:", error);
    throw error;
  }
};

export const deleteReview = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/reviews/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting review:", error);
    throw error;
  }
};
