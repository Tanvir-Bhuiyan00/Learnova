import { CourseLevel, CourseStatus } from "../../../generated/prisma/enums";

export interface ICreateCoursePayload {
  title: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  level?: CourseLevel;
  language?: string;
  categoryId: string;
  instructorId?: string;
  thumbnail?: string;
}

export interface IUpdateCoursePayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  level?: CourseLevel;
  language?: string;
  categoryId?: string;
  status?: CourseStatus;
}

export interface ICreateModulePayload {
  title: string;
  description?: string;
  order: number;
}

export interface IUpdateModulePayload {
  title?: string;
  description?: string;
  order?: number;
}

export interface ICreateLessonPayload {
  title: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  content?: string;
  order: number;
  isFree?: boolean;
}

export interface IUpdateLessonPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  content?: string;
  order?: number;
  isFree?: boolean;
}
