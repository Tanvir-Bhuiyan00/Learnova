export interface IEnrollment {
  id: string;
  progress: number;
  isCompleted: boolean;
  completedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  courseId: string;
}

export interface IEnrollmentFilter {
  studentId?: string;
  courseId?: string;
  isCompleted?: boolean;
  isDeleted?: boolean;
}
