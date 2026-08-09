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

export interface IGradeSubmissionPayload {
  marks: number;
  feedback?: string;
}
