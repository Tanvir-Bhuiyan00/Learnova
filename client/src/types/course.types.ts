export interface ICourse {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  price: number;
  discountPrice?: number | null;
  currency: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  language: string;
  totalDuration?: number | null;
  totalLessons: number;
  totalStudents: number;
  averageRating: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  instructorId: string;
}

export interface IInstructorLite {
  id: string;
  name: string;
  designation?: string | null;
  qualification?: string | null;
  bio?: string | null;
  experience?: number;
  averageRating: number;
  profilePhoto?: string | null;
  user?: { name?: string; email?: string };
}

export interface ICategoryLite {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
}

export interface ICourseDetail extends ICourse {
  category?: ICategoryLite;
  instructor?: IInstructorLite;
  modules?: IModule[];
}

export interface ICreateCoursePayload {
  title: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  language?: string;
  categoryId: string;
  thumbnail?: string;
}

export interface IUpdateCoursePayload {
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  discountPrice?: number;
  currency?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  language?: string;
  categoryId?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface IModule {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  courseId: string;
  lessons?: ILesson[];
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

export interface ILesson {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  videoDuration?: number | null;
  content?: string | null;
  order: number;
  isFree: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  moduleId: string;
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

export interface ILessonProgress {
  completedLessonIds: string[];
  completedLessons: number;
  totalLessons: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: string | null;
}
