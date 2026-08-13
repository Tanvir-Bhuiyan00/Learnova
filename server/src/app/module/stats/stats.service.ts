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

  setCached(cacheKey, result, 60);

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

  const [revenueByMonth, enrollmentTrend, userSignupTrend, recentActivity] =
    await Promise.all([
      getRevenueByMonth(),
      getEnrollmentTrend(),
      getUserSignupTrend(),
      buildRecentActivity(),
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
    recentActivity,
  };
};

const getInstructorDashboardStats = async (
  user: IRequestUser,
): Promise<IInstructorDashboardStats> => {
  const instructor = await prisma.instructor.findUniqueOrThrow({
    where: { userId: user.userId },
    include: {
      courses: {
        where: { isDeleted: false },
        select: {
          id: true,
          title: true,
          thumbnail: true,
          status: true,
          averageRating: true,
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
    pendingSubmissions,
    gradingQueue,
    courseCompletions,
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
    courseIds.length > 0
      ? prisma.assignmentSubmission.count({
          where: {
            isDeleted: false,
            gradedAt: null,
            assignment: { courseId: { in: courseIds }, isDeleted: false },
          },
        })
      : Promise.resolve(0),
    courseIds.length > 0
      ? prisma.assignmentSubmission.findMany({
          where: {
            isDeleted: false,
            gradedAt: null,
            assignment: { courseId: { in: courseIds }, isDeleted: false },
          },
          select: {
            id: true,
            submittedAt: true,
            student: { select: { name: true } },
            assignment: { select: { title: true, course: { select: { title: true } } } },
          },
          orderBy: { submittedAt: "desc" },
          take: 8,
        })
      : Promise.resolve([]),
    courseIds.length > 0
      ? prisma.enrollment.findMany({
          where: { courseId: { in: courseIds }, isDeleted: false },
          select: {
            courseId: true,
            isCompleted: true,
          },
        })
      : Promise.resolve([]),
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

  // Per-course completion rate: completed enrollments / total enrollments
  const completionByCourse = new Map<string, { total: number; done: number }>();
  for (const e of courseCompletions) {
    const entry = completionByCourse.get(e.courseId) ?? { total: 0, done: 0 };
    entry.total += 1;
    if (e.isCompleted) entry.done += 1;
    completionByCourse.set(e.courseId, entry);
  }

  const courseList = instructor.courses.map((c) => {
    const comp = completionByCourse.get(c.id);
    const completionRate =
      comp && comp.total > 0 ? Number(((comp.done / comp.total) * 100).toFixed(0)) : 0;
    const students =
      totalStudents.find((g) => g.courseId === c.id)?._count.studentId ?? 0;
    return {
      id: c.id,
      title: c.title,
      thumbnail: c.thumbnail,
      studentCount: students,
      averageRating: c.averageRating,
      completionRate,
      status: c.status,
    };
  });

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
    pendingSubmissions,
    gradingQueue: gradingQueue.map((g) => ({
      id: g.id,
      studentName: g.student.name,
      courseTitle: g.assignment.course.title,
      assignmentTitle: g.assignment.title,
      submittedAt: g.submittedAt,
    })),
    courseList,
    recentReviews,
    revenueByMonth,
    enrollmentTrend,
  };
};

const getStudentDashboardStats = async (
  user: IRequestUser,
): Promise<IStudentDashboardStats> => {
  const student = await prisma.student.findUniqueOrThrow({
    where: { userId: user.userId },
  });

  const [
    totalEnrollments,
    completedCourses,
    totalCertificates,
    totalSpentAgg,
    progressAgg,
    recentEnrollments,
    lessonProgressAgg,
    totalLessons,
    assignmentCountAgg,
    submissionCountAgg,
    quizCountAgg,
    attemptCountAgg,
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
    prisma.lessonProgress.count({
      where: {
        enrollment: { studentId: student.id, isDeleted: false },
        isCompleted: true,
      },
    }),
    prisma.lesson.count({
      where: {
        isDeleted: false,
        module: { isDeleted: false, course: { enrollments: { some: { studentId: student.id, isDeleted: false } } } },
      },
    }),
    prisma.assignment.count({
      where: {
        isDeleted: false,
        course: { isDeleted: false, enrollments: { some: { studentId: student.id, isDeleted: false } } },
      },
    }),
    prisma.assignmentSubmission.count({
      where: { studentId: student.id, isDeleted: false },
    }),
    prisma.quiz.count({
      where: {
        isDeleted: false,
        course: { isDeleted: false, enrollments: { some: { studentId: student.id, isDeleted: false } } },
      },
    }),
    prisma.quizAttempt.count({
      where: { studentId: student.id, isDeleted: false, completedAt: { not: null } },
    }),
  ]);

  // Upcoming deadlines: enrolled courses' assignments/quizzes due in the future
  const [upcomingAssignments, upcomingQuizzes] = await Promise.all([
    prisma.assignment.findMany({
      where: {
        isDeleted: false,
        dueDate: { gt: new Date() },
        course: { enrollments: { some: { studentId: student.id, isDeleted: false } } },
      },
      select: { id: true, title: true, dueDate: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    prisma.quiz.findMany({
      where: {
        isDeleted: false,
        course: { enrollments: { some: { studentId: student.id, isDeleted: false } } },
      },
      select: { id: true, title: true },
      take: 5,
    }),
  ]);

  const upcoming = [
    ...upcomingAssignments.map((a) => ({
      id: `assignment-${a.id}`,
      type: "assignment" as const,
      title: a.title,
      date: a.dueDate!,
    })),
    ...upcomingQuizzes.map((q) => ({
      id: `quiz-${q.id}`,
      type: "test" as const,
      title: q.title,
      date: new Date(),
    })),
  ]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 6);

  return {
    totalEnrollments,
    completedCourses,
    inProgressCourses: totalEnrollments - completedCourses,
    totalCertificates,
    totalSpent: totalSpentAgg._sum.amount || 0,
    averageProgress: Number(
      (progressAgg._avg.progress || 0).toFixed(2),
    ),
    lessonsCompleted: lessonProgressAgg,
    totalLessons,
    assignmentsSubmitted: submissionCountAgg,
    totalAssignments: assignmentCountAgg,
    quizzesTaken: attemptCountAgg,
    totalQuizzes: quizCountAgg,
    upcoming,
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

const buildRecentActivity = async () => {
  const [recentEnrollments, recentPayments, recentUsers] = await Promise.all([
    prisma.enrollment.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        createdAt: true,
        student: { select: { name: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.payment.findMany({
      where: { status: PaymentStatus.SUCCEEDED, isDeleted: false },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        student: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.user.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const activity = [
    ...recentEnrollments.map((e) => ({
      id: `enrollment-${e.id}`,
      type: "enrollment" as const,
      userName: e.student.name,
      detail: e.course.title,
      amount: undefined,
      createdAt: e.createdAt,
      status: "Enrolled",
    })),
    ...recentPayments.map((p) => ({
      id: `payment-${p.id}`,
      type: "payment" as const,
      userName: p.student.name,
      detail: "Course purchase",
      amount: p.amount,
      createdAt: p.createdAt,
      status: "Paid",
    })),
    ...recentUsers.map((u) => ({
      id: `signup-${u.id}`,
      type: "signup" as const,
      userName: u.name,
      detail: "New account",
      amount: undefined,
      createdAt: u.createdAt,
      status: "Active",
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10);

  return activity;
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
