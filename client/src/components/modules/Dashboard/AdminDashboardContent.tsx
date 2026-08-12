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
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

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
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Overview
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          A snapshot of your platform at a glance.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Users"
          value={data?.totalUsers || 0}
          iconName="Users"
          description="Number of registered users"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Students"
          value={data?.totalStudents || 0}
          iconName="GraduationCap"
          description="Number of students enrolled"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Instructors"
          value={data?.totalInstructors || 0}
          iconName="Presentation"
          description="Number of instructors"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Courses"
          value={data?.totalCourses || 0}
          iconName="BookOpen"
          description="Number of courses"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Enrollments"
          value={data?.totalEnrollments || 0}
          iconName="ClipboardList"
          description="Number of enrollments"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Total Revenue"
          value={data?.totalRevenue || 0}
          iconName="DollarSign"
          description="Total revenue generated"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Average Rating"
          value={data?.averageRating || 0}
          iconName="Star"
          description="Average course rating"
        />
        </motion.div>
        <motion.div variants={fadeInUp}>
        <StatsCard
          title="Completion Rate"
          value={`${data?.completionRate || 0}%`}
          iconName="CheckCircle"
          description="Course completion rate"
        />
        </motion.div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <EnrollmentBarChart data={data?.revenueByMonth || []} />
        <EnrollmentPieChart
          data={data?.userRoleDistribution || []}
          title="User Role Distribution"
          description="Distribution of users by role"
        />
      </div>
    </div>
  );
};

export default AdminDashboardContent;
