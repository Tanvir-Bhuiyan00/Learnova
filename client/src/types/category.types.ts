export interface ICategory {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface ICreateCategoryPayload {
  title: string;
  description?: string;
  icon?: string;
}

export interface IUpdateCategoryPayload {
  title?: string;
  description?: string;
  icon?: string;
}
