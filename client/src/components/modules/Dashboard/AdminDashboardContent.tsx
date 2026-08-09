"use client";

import EnrollmentBarChart from "@/components/shared/EnrollmentBarChart";
import EnrollmentPieChart from "@/components/shared/EnrollmentPieChart";
import StatsCard from "@/components/shared/StatsCard";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { getDashboardData } from "@/services/dashboard.services";
import { ApiResponse } from "@/types/api.types";
import { ISuperAdminDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";

const AdminDashboardContent = () => {
  const { data: adminDashboardData } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: getDashboardData,
    refetchOnWindowFocus: "always",
  });

  const { data } = adminDashboardData as ApiResponse<ISuperAdminDashboardStats>;

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
