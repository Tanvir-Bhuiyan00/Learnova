export interface IReview {
  id: string;
  rating: number;
  comment?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  courseId: string;
  instructorId?: string | null;
}

export interface ICreateReviewPayload {
  courseId: string;
  rating: number;
  comment: string;
}

export interface IUpdateReviewPayload {
  rating?: number;
  comment?: string;
}
