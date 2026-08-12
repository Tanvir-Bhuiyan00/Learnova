"use client";

import dynamic from "next/dynamic";
import StatsCard from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { getDashboardData } from "@/services/dashboard.services";
import { ApiResponse } from "@/types/api.types";
import { ISuperAdminDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  CreditCard,
  GraduationCap,
  PlusCircle,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

// recharts is heavy — load it only when the admin dashboard is opened.
const EnrollmentBarChart = dynamic(
  () =>
    import("@/components/shared/EnrollmentBarChart").then((mod) => mod.default),
  { ssr: false },
);

const EnrollmentPieChart = dynamic(
  () =>
    import("@/components/shared/EnrollmentPieChart").then((mod) => mod.default),
  { ssr: false },
);

const quickActions = [
  { label: "Manage Courses", href: "/admin/dashboard/courses-management", icon: BookOpen, color: "text-blue-600 dark:text-blue-400" },
  { label: "Add Instructor", href: "/admin/dashboard/instructors-management", icon: GraduationCap, color: "text-green-600 dark:text-green-400" },
  { label: "View Payments", href: "/admin/dashboard/payments-management", icon: CreditCard, color: "text-emerald-600 dark:text-emerald-400" },
  { label: "Manage Users", href: "/admin/dashboard/users-management", icon: Users, color: "text-indigo-600 dark:text-indigo-400" },
];

const AdminDashboardContent = () => {
  const {
    data: adminDashboardData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: "always",
  });

  const { data } = adminDashboardData as ApiResponse<ISuperAdminDashboardStats>;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed p-16 text-center">
        <AlertTriangle className="size-10 text-negative" />
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">
            Couldn&apos;t load your dashboard
          </h2>
          <p className="mt-1 text-sm text-mute-text">
            Something went wrong while fetching your stats.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} className="rounded-full">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Overview
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            A snapshot of your platform at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary-pale px-4 py-2 text-sm font-semibold text-ink-deep">
          <TrendingUp className="size-4" />
          {data?.totalRevenue != null && (
            <>
              Total Revenue{" "}
              <span className="ml-1 font-heading text-lg font-extrabold">
                ৳{data.totalRevenue.toLocaleString("en-US")}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.label}
            variants={fadeInUp}
            custom={i}
          >
            <Link href={action.href}>
              <Button
                variant="outline"
                className="gap-2 rounded-full bg-card px-4 text-sm font-medium ring-1 ring-border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/40"
              >
                <action.icon className={`size-4 ${action.color}`} />
                {action.label}
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <StatsCard
          index={0}
          title="Total Users"
          value={data?.totalUsers || 0}
          iconName="Users"
          description="Registered users"
        />
        <StatsCard
          index={1}
          title="Students"
          value={data?.totalStudents || 0}
          iconName="GraduationCap"
          description="Enrolled students"
        />
        <StatsCard
          index={2}
          title="Instructors"
          value={data?.totalInstructors || 0}
          iconName="Presentation"
          description="Active instructors"
        />
        <StatsCard
          index={3}
          title="Courses"
          value={data?.totalCourses || 0}
          iconName="BookOpen"
          description="Published courses"
        />
        <StatsCard
          index={4}
          title="Enrollments"
          value={data?.totalEnrollments || 0}
          iconName="ClipboardList"
          description="Total enrollments"
        />
        <StatsCard
          index={5}
          title="Revenue"
          value={data?.totalRevenue || 0}
          iconName="DollarSign"
          description="Total revenue"
        />
        <StatsCard
          index={6}
          title="Avg Rating"
          value={data?.averageRating || 0}
          iconName="Star"
          description="Course rating"
        />
        <StatsCard
          index={7}
          title="Completion"
          value={`${data?.completionRate || 0}%`}
          iconName="CheckCircle"
          description="Completion rate"
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2"
      >
        <EnrollmentBarChart data={data?.revenueByMonth || []} />
        <EnrollmentPieChart
          data={data?.userRoleDistribution || []}
          title="User Role Distribution"
          description="Distribution of users by role"
        />
      </motion.div>
    </div>
  );
};

export default AdminDashboardContent;