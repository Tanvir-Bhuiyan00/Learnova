import status from "http-status";
import { PaymentStatus, UserRole } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { getCached, setCached } from "../../utils/cache";
import type {
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
  const cacheKey = `stats:${user.role}:${user.userId}`;
  const cached = getCached<IDashboardStats>(cacheKey);
  if (cached) {
    return cached;
  }

  let result: IDashboardStats;

  switch (user.role) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      result = await getAdminDashboardStats();
      break;
    case UserRole.INSTRUCTOR:
      result = await getInstructorDashboardStats(user);
      break;
    case UserRole.STUDENT:
      result = await getStudentDashboardStats(user);
      break;
    default:
      throw new AppError(status.BAD_REQUEST, "Invalid user role");
  }

  setCached(cacheKey, result, 30);

  return result;
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

  const topCourseIds = topCoursesRaw.map((course) => course.id);
  const paymentsForTopCourses =
    topCourseIds.length > 0
      ? await prisma.payment.findMany({
          where: {
            status: PaymentStatus.SUCCEEDED,
            enrollment: { courseId: { in: topCourseIds } },
          },
          select: {
            amount: true,
            enrollment: { select: { courseId: true } },
          },
        })
      : [];

  const revenueByCourseId = new Map<string, number>();
  for (const payment of paymentsForTopCourses) {
    const courseId = payment.enrollment.courseId;
    revenueByCourseId.set(
      courseId,
      (revenueByCourseId.get(courseId) ?? 0) + payment.amount,
    );
  }

  const topCourses: ITopCourse[] = topCoursesRaw.map((course) => ({
    id: course.id,
    title: course.title,
    thumbnail: course.thumbnail,
    instructorName: course.instructor.name,
    enrollmentCount: course._count.enrollments,
    averageRating: course.averageRating,
    revenue: revenueByCourseId.get(course.id) || 0,
  }));

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
      (progressAgg._avg.progress || 0).toFixed(2),
    ),
    recentEnrollments: recentEnrollments.map((e) => ({
      id: e.id,
      courseTitle: e.course.title,
      courseThumbnail: e.course.thumbnail,
      progress: Number(e.progress.toFixed(2)),
      isCompleted: e.isCompleted,
      createdAt: e.createdAt,
    })),
  };
};

const getRevenueByMonth = async (
  courseIds?: string[],
): Promise<IRevenueDataPoint[]> => {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`p.status = 'SUCCEEDED'`,
    Prisma.sql`p."isDeleted" = false`,
  ];

  if (courseIds && courseIds.length > 0) {
    conditions.push(Prisma.sql`e."courseId" IN (${Prisma.join(courseIds)})`);
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows: { month: Date; revenue: number }[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', p."createdAt") AS month,
      COALESCE(SUM(p.amount), 0) AS revenue
    FROM payments p
    LEFT JOIN enrollments e ON e.id = p."enrollmentId"
    WHERE ${Prisma.join(conditions, " AND ")}
      AND p."createdAt" >= ${twelveMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

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
  const conditions: Prisma.Sql[] = [Prisma.sql`e."isDeleted" = false`];

  if (courseIds && courseIds.length > 0) {
    conditions.push(Prisma.sql`e."courseId" IN (${Prisma.join(courseIds)})`);
  }

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const rows: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', e."createdAt") AS month,
      CAST(COUNT(*) AS INTEGER) AS count
    FROM enrollments e
    WHERE ${Prisma.join(conditions, " AND ")}
      AND e."createdAt" >= ${twelveMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

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

  const rows: { month: Date; count: number }[] = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "createdAt") AS month,
      CAST(COUNT(*) AS INTEGER) AS count
    FROM users
    WHERE "isDeleted" = false
      AND "createdAt" >= ${twelveMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

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
