import status from "http-status";
import { Category } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload, IUpdateCategoryPayload } from "./category.interface";

const createCategory = async (payload: ICreateCategoryPayload): Promise<Category> => {
  const existingCategory = await prisma.category.findUnique({
    where: { title: payload.title },
  });

  if (existingCategory) {
    throw new AppError(status.CONFLICT, "Category with this title already exists");
  }

  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategories = async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
  return categories;
};

const getCategoryById = async (id: string): Promise<Category | null> => {
  const category = await prisma.category.findUnique({
    where: { id, isDeleted: false },
  });
  return category;
};

const updateCategory = async (id: string, payload: IUpdateCategoryPayload): Promise<Category> => {
  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  if (payload.title) {
    const duplicateTitle = await prisma.category.findFirst({
      where: { title: payload.title, id: { not: id } },
    });
    if (duplicateTitle) {
      throw new AppError(status.CONFLICT, "Category with this title already exists");
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });

  return category;
};

const deleteCategory = async (id: string): Promise<Category> => {
  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist) {
    throw new AppError(status.NOT_FOUND, "Category not found");
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return category;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
