export interface ICertificate {
  id: string;
  certificateUrl: string;
  issuedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
}

export interface IGenerateCertificatePayload {
  enrollmentId: string;
}
