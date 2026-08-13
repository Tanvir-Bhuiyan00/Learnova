import { UserRole } from "@/lib/authUtils";
import { UserStatus } from "@/types/instructor.types";

export interface IAdmin {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  designation?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    email?: string;
    role: UserRole;
    status: UserStatus;
    isDeleted: boolean;
  };
}

export interface IChangeUserStatusPayload {
  userId: string;
  userStatus: UserStatus;
}

export interface IChangeUserRolePayload {
  userId: string;
  role: UserRole;
}
