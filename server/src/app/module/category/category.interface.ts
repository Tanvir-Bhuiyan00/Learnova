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
