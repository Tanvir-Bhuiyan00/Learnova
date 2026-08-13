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
  user?: {
    id: string;
    email?: string;
    role?: string;
    status?: string;
    image?: string | null;
    isDeleted?: boolean;
    createdAt?: string;
  };
}

export interface IUpdateStudentPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
}
