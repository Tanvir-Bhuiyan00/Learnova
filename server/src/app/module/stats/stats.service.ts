import status from "http-status";
import { PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import type {
  IChartDataPoint,
  IDashboardStats,
  IEnrollmentTrendPoint,
  IInstructorDashboardStats,
  IRevenueDataPoint,
  IStudentDashboardStats,
  ISuperAdminDashboardStats,
  ITopCourse,
  IUserSignupTrendPoint,
} from "./stats.interface";

const getDashboardStatsData = async (
  user: IRequestUser,
): Promise<IDashboardStats> => {
  switch (user.role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return getAdminDashboardStats();
    case UserRole.INSTRUCTOR:
      return getInstructorDashboardStats(user);
    case UserRole.STUDENT:
      return getStudentDashboardStats(user);
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }
};

const getAdminDashboardStats = async (): Promise<ISuperAdminDashboardStats> => {
  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    totalCourses,
    totalEnrollments,
    totalRevenue,
    totalReviews,
    totalCertificatesIssued,
    averageRating,
    completedEnrollments,
    userRoleDistribution,
    courseStatusDistribution,
    topCoursesRaw,
    courseCategoryDistribution,
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.student.count({ where: { isDeleted: false } }),
    prisma.instructor.count({ where: { isDeleted: false } }),
    prisma.admin.count({ where: { isDeleted: false } }),
    prisma.course.count({ where: { isDeleted: false } }),
    prisma.enrollment.count({ where: { isDeleted: false } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: PaymentStatus.SUCCEEDED, isDeleted: false },
    }),
    prisma.review.count({ where: { isDeleted: false } }),
    prisma.certificate.count(),
    prisma.review.aggregate({
      _avg: { rating: true },
      where: { isDeleted: false },
    }),
    prisma.enrollment.count({
      where: { isDeleted: false, isCompleted: true },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { id: true },
      where: { isDeleted: false },
    }),
    prisma.course.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { isDeleted: false },
    }),
    prisma.course.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        title: true,
        thumbnail: true,
        averageRating: true,
        instructor: { select: { name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { totalStudents: "desc" },
      take: 10,
    }),
    prisma.course.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      where: { isDeleted: false },
    }),
  ]);

  const [revenueByMonth, enrollmentTrend, userSignupTrend] =
    await Promise.all([
      getRevenueByMonth(),
      getEnrollmentTrend(),
      getUserSignupTrend(),
    ]);

  const topCourses: ITopCourse[] = await Promise.all(
    topCoursesRaw.map(async (course) => {
      const revenueAgg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          enrollment: { courseId: course.id },
          status: PaymentStatus.SUCCEEDED,
        },
      });
      return {
        id: course.id,
        title: course.title,
        thumbnail: course.thumbnail,
        instructorName: course.instructor.name,
        enrollmentCount: course._count.enrollments,
        averageRating: course.averageRating,
        revenue: revenueAgg._sum.amount || 0,
      };
    }),
  );

  const completionRate =
    totalEnrollments > 0
      ? Number((completedEnrollments / totalEnrollments * 100).toFixed(2))
      : 0;

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    totalCourses,
    totalEnrollments,
    totalRevenue: totalRevenue._sum.amount || 0,
    totalReviews,
    totalCertificatesIssued,
    averageRating: Number((averageRating._avg.rating || 0).toFixed(2)),
    completionRate,
    userRoleDistribution: userRoleDistribution.map((item) => ({
      label: item.role,
      value: item._count.id,
    })),
    courseStatusDistribution: courseStatusDistribution.map((item) => ({
      label: item.status,
      value: item._count.id,
    })),
    revenueByMonth,
    enrollmentTrend,
    userSignupTrend,
    topCourses,
    courseCategoryDistribution: courseCategoryDistribution.map((item) => ({
      label: item.categoryId,
      value: item._count.id,
    })),
  };
};

const getInstructorDashboardStats = async (
  user: IRequestUser,
): Promise<IInstructorDashboardStats> => {
  const instructor = await prisma.instructor.findUniqueOrThrow({
    where: { email: user.email },
    include: {
      courses: {
        where: { isDeleted: false },
        select: {
          id: true,
          title: true,
          _count: { select: { enrollments: true } },
          reviews: {
            where: { isDeleted: false },
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              student: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      },
    },
  });

  const courseIds = instructor.courses.map((c) => c.id);

  const [
    totalStudents,
    totalRevenueAgg,
    averageRatingAgg,
    totalReviewsAgg,
  ] = await Promise.all([
    courseIds.length > 0
      ? prisma.enrollment.groupBy({
          by: ["courseId"],
          where: { courseId: { in: courseIds }, isDeleted: false },
          _count: { studentId: true },
        })
      : Promise.resolve([]),
    courseIds.length > 0
      ? prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            enrollment: { courseId: { in: courseIds } },
            status: PaymentStatus.SUCCEEDED,
          },
        })
      : Promise.resolve({ _sum: { amount: 0 } }),
    courseIds.length > 0
      ? prisma.review.aggregate({
          _avg: { rating: true },
          where: { courseId: { in: courseIds }, isDeleted: false },
        })
      : Promise.resolve({ _avg: { rating: 0 } }),
    courseIds.length > 0
      ? prisma.review.count({
          where: { courseId: { in: courseIds }, isDeleted: false },
        })
      : Promise.resolve(0),
  ]);

  const recentReviews = instructor.courses
    .flatMap((c) =>
      c.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        studentName: r.student.name,
        courseTitle: c.title,
        createdAt: r.createdAt,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const totalStudentCount = totalStudents.reduce(
    (sum, g) => sum + g._count.studentId,
    0,
  );

  const [revenueByMonth, enrollmentTrend] = await Promise.all([
    getRevenueByMonth(courseIds),
    getEnrollmentTrend(courseIds),
  ]);

  return {
    totalCourses: instructor.courses.length,
    totalStudents: totalStudentCount,
    averageRating: Number((averageRatingAgg._avg.rating || 0).toFixed(2)),
    totalRevenue: totalRevenueAgg._sum.amount || 0,
    totalReviews: totalReviewsAgg,
    recentReviews,
    revenueByMonth,
    enrollmentTrend,
  };
};

const getStudentDashboardStats = async (
  user: IRequestUser,
): Promise<IStudentDashboardStats> => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { email: user.email },
  });

  const [
    totalEnrollments,
    completedCourses,
    totalCertificates,
    totalSpentAgg,
    progressAgg,
    recentEnrollments,
  ] = await Promise.all([
    prisma.enrollment.count({
      where: { studentId: student.id, isDeleted: false },
    }),
    prisma.enrollment.count({
      where: { studentId: student.id, isDeleted: false, isCompleted: true },
    }),
    prisma.certificate.count({ where: { studentId: student.id } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { studentId: student.id, status: PaymentStatus.SUCCEEDED },
    }),
    prisma.enrollment.aggregate({
      _avg: { progress: true },
      where: { studentId: student.id, isDeleted: false },
    }),
    prisma.enrollment.findMany({
      where: { studentId: student.id, isDeleted: false },
      select: {
        id: true,
        progress: true,
        isCompleted: true,
        createdAt: true,
        course: { select: { title: true, thumbnail: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    totalEnrollments,
    completedCourses,
    inProgressCourses: totalEnrollments - completedCourses,
    totalCertificates,
    totalSpent: totalSpentAgg._sum.amount || 0,
    averageProgress: Number(
      ((progressAgg._avg.progress || 0) * 100).toFixed(2),
    ),
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      courseTitle: e.course.title,
      courseThumbnail: e.course.thumbnail,
      progress: Number((e.progress * 100).toFixed(2)),
      isCompleted: e.isCompleted,
      createdAt: e.createdAt,
    })),
  };
};

const getRevenueByMonth = async (
  courseIds?: string[],
): Promise<IRevenueDataPoint[]> => {
  const conditions: string[] = [
    "p.status = 'SUCCEEDED'",
    "p.is_deleted = false",
  ];

  if (courseIds && courseIds.length > 0) {
    const ids = courseIds.map((id) => `'${id}'`).join(",");
    conditions.push(`e.course_id IN (${ids})`);
  }

  const joinClause = courseIds && courseIds.length > 0
    ? "LEFT JOIN enrollments e ON e.id = p.enrollment_id"
    : "LEFT JOIN enrollments e ON e.id = p.enrollment_id";

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows: { month: Date; revenue: number }[] = await prisma.$queryRawUnsafe(
    `
    SELECT
      DATE_TRUNC('month', p.created_at) AS month,
      COALESCE(SUM(p.amount), 0) AS revenue
    FROM payments p
    ${joinClause}
    WHERE ${conditions.join(" AND ")}
      AND p.created_at >= $1
    GROUP BY month
    ORDER BY month ASC
    `,
    twelveMonthsAgo.toISOString(),
  );

  const monthMap = new Map<string, number>();
  for (const r of rows) {
    const key = new Date(r.month).toISOString().slice(0, 7);
    monthMap.set(key, Number(r.revenue));
  }

  return buildMonthSeries((monthKey) => ({
    month: monthKey,
    revenue: monthMap.get(monthKey) || 0,
  }));
};

const getEnrollmentTrend = async (
  courseIds?: string[],
): Promise<IEnrollmentTrendPoint[]> => {
  const conditions: string[] = ["e.is_deleted = false"];

  if (courseIds && courseIds.length > 0) {
    const ids = courseIds.map((id) => `'${id}'`).join(",");
    conditions.push(`e.course_id IN (${ids})`);
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows: { month: Date; count: number }[] = await prisma.$queryRawUnsafe(
    `
    SELECT
      DATE_TRUNC('month', e.created_at) AS month,
      CAST(COUNT(*) AS INTEGER) AS count
    FROM enrollments e
    WHERE ${conditions.join(" AND ")}
      AND e.created_at >= $1
    GROUP BY month
    ORDER BY month ASC
    `,
    twelveMonthsAgo.toISOString(),
  );

  const monthMap = new Map<string, number>();
  for (const r of rows) {
    const key = new Date(r.month).toISOString().slice(0, 7);
    monthMap.set(key, Number(r.count));
  }

  return buildMonthSeries((monthKey) => ({
    month: monthKey,
    enrollments: monthMap.get(monthKey) || 0,
  }));
};

const getUserSignupTrend = async (): Promise<IUserSignupTrendPoint[]> => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows: { month: Date; count: number }[] = await prisma.$queryRawUnsafe(
    `
    SELECT
      DATE_TRUNC('month', created_at) AS month,
      CAST(COUNT(*) AS INTEGER) AS count
    FROM users
    WHERE is_deleted = false
      AND created_at >= $1
    GROUP BY month
    ORDER BY month ASC
    `,
    twelveMonthsAgo.toISOString(),
  );

  const monthMap = new Map<string, number>();
  for (const r of rows) {
    const key = new Date(r.month).toISOString().slice(0, 7);
    monthMap.set(key, Number(r.count));
  }

  return buildMonthSeries((monthKey) => ({
    month: monthKey,
    signups: monthMap.get(monthKey) || 0,
  }));
};

function buildMonthSeries<T>(
  mapFn: (monthKey: string) => T,
): T[] {
  const result: T[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = d.toISOString().slice(0, 7);
    result.push(mapFn(monthKey));
  }

  return result;
}

export const StatsService = {
  getDashboardStatsData,
};
