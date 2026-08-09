export interface IAssignment {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  dueDate?: string | null;
  totalMarks: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  courseId: string;
}

export interface ICreateAssignmentPayload {
  courseId: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  totalMarks: number;
}

export interface IUpdateAssignmentPayload {
  title?: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  totalMarks?: number;
}

export interface IAssignmentSubmission {
  id: string;
  fileUrl?: string | null;
  content?: string | null;
  marks?: number | null;
  feedback?: string | null;
  submittedAt: string;
  gradedAt?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  assignmentId: string;
  studentId: string;
}

export interface IGradeSubmissionPayload {
  marks: number;
  feedback?: string;
}
