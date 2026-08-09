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
  student?: {
    id: string;
    name: string;
    email?: string;
    profilePhoto?: string | null;
  };
  course?: {
    id: string;
    title: string;
    thumbnail?: string | null;
  };
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
