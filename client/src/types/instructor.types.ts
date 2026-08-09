export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}

export interface IInstructor {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
  address?: string | null;
  bio?: string | null;
  qualification?: string | null;
  experience: number;
  currentWorkingPlace?: string | null;
  designation?: string | null;
  averageRating: number;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    emailVerified?: boolean;
    role: string;
    status: UserStatus;
    image?: string | null;
    isDeleted: boolean;
    needPasswordChange?: boolean;
    createdAt?: string;
  };
}

export interface IInstructorDetails extends IInstructor {
  courses: Array<{
    id: string;
    title: string;
    thumbnail?: string | null;
    price: number;
    status: string;
    averageRating: number;
    totalStudents?: number | null;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment?: string | null;
    createdAt: string;
  }>;
}

export interface ICreateInstructorPayload {
  password: string;
  instructor: {
    name: string;
    email: string;
    contactNumber?: string;
    address?: string;
    profilePhoto?: string;
    bio?: string;
    qualification: string;
    experience?: number;
    currentWorkingPlace: string;
    designation: string;
  };
}

export interface IUpdateInstructorPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  bio?: string;
  qualification?: string;
  experience?: number;
  currentWorkingPlace?: string;
  designation?: string;
}
