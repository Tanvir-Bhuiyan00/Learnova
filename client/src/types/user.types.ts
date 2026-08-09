import { UserRole } from "@/lib/authUtils";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string | null;
  status?: string;
  isDeleted?: boolean;
  emailVerified?: boolean;
  needPasswordChange?: boolean;
  createdAt?: string;
}
