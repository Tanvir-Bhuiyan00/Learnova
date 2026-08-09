export interface IStudent {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface IUpdateStudentPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}
