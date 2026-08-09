"use server";

import { httpClient } from "@/lib/axios/httpClient";
import {
  ICategory,
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
} from "@/types/category.types";

export const getCategories = async (queryString?: string) => {
  try {
    const categories = await httpClient.get<ICategory[]>(
      `/categories${queryString ? `?${queryString}` : ""}`,
    );
    return categories;
  } catch (error) {
    console.log("Error fetching categories:", error);
    throw error;
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const category = await httpClient.get<ICategory>(`/categories/${id}`);
    return category;
  } catch (error) {
    console.log("Error fetching category details:", error);
    throw error;
  }
};

export const createCategory = async (payload: ICreateCategoryPayload) => {
  try {
    const category = await httpClient.post<ICategory>("/categories", payload);
    return category;
  } catch (error) {
    console.log("Error creating category:", error);
    throw error;
  }
};

export const updateCategory = async (id: string, payload: IUpdateCategoryPayload) => {
  try {
    const category = await httpClient.patch<ICategory>(`/categories/${id}`, payload);
    return category;
  } catch (error) {
    console.log("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const result = await httpClient.delete<{ message: string }>(`/categories/${id}`);
    return result;
  } catch (error) {
    console.log("Error deleting category:", error);
    throw error;
  }
};
