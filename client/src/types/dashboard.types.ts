export interface NavItem {
  title: string;
  href: string;
  icon: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export interface IChartDataPoint {
  label: string;
  value: number;
}

export interface IRevenueDataPoint {
  month: string;
  revenue: number;
}

export interface IEnrollmentTrendPoint {
  month: string;
  enrollments: number;
}

export interface IUserSignupTrendPoint {
  month: string;
  signups: number;
}

export interface ITopCourse {
  id: string;
  title: string;
  thumbnail: string | null;
  instructorName: string;
  enrollmentCount: number;
  averageRating: number;
  revenue: number;
}

export interface ISuperAdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalRevenue: number;
  totalReviews: number;
  totalCertificatesIssued: number;
  averageRating: number;
  completionRate: number;
  userRoleDistribution: IChartDataPoint[];
  courseStatusDistribution: IChartDataPoint[];
  revenueByMonth: IRevenueDataPoint[];
  enrollmentTrend: IEnrollmentTrendPoint[];
  userSignupTrend: IUserSignupTrendPoint[];
  topCourses: ITopCourse[];
  courseCategoryDistribution: IChartDataPoint[];
  recentActivity: {
    id: string;
    type: "enrollment" | "payment" | "signup";
    userName: string;
    detail: string;
    amount?: number;
    createdAt: string;
    status: string;
  }[];
}

export interface IInstructorDashboardStats {
  totalCourses: number;
  totalStudents: number;
  averageRating: number;
  totalRevenue: number;
  totalReviews: number;
  pendingSubmissions: number;
  gradingQueue: {
    id: string;
    studentName: string;
    courseTitle: string;
    assignmentTitle: string;
    submittedAt: string;
  }[];
  courseList: {
    id: string;
    title: string;
    thumbnail: string | null;
    studentCount: number;
    averageRating: number;
    completionRate: number;
    status: string;
  }[];
  recentReviews: {
    id: string;
    rating: number;
    comment: string | null;
    studentName: string;
    courseTitle: string;
    createdAt: string;
  }[];
  revenueByMonth: IRevenueDataPoint[];
  enrollmentTrend: IEnrollmentTrendPoint[];
}

export interface IStudentDashboardStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  totalCertificates: number;
  totalSpent: number;
  averageProgress: number;
  lessonsCompleted: number;
  totalLessons: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  quizzesTaken: number;
  totalQuizzes: number;
  upcoming: {
    id: string;
    type: "assignment" | "test";
    title: string;
    date: string;
  }[];
  recentEnrollments: {
    id: string;
    courseTitle: string;
    courseThumbnail: string | null;
    progress: number;
    isCompleted: boolean;
    createdAt: string;
  }[];
}

export type IDashboardStats =
  | ISuperAdminDashboardStats
  | IInstructorDashboardStats
  | IStudentDashboardStats;
