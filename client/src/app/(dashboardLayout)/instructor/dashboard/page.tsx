"use client";

import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/shared/StatsCard";
import { getDashboardData } from "@/services/dashboard.services";
import { IInstructorDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";

const InstructorDashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-dashboard"],
    queryFn: () => getDashboardData(),
  });

  const stats: IInstructorDashboardStats | null = data?.data as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          Instructor overview
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Track your courses, students, and earnings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Courses"
          value={stats?.totalCourses ?? 0}
          iconName="BookOpen"
          description="Courses you have published"
        />
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          iconName="Users"
          description="Students across your courses"
        />
        <StatsCard
          title="Avg Rating"
          value={stats?.averageRating?.toFixed(1) ?? "0.0"}
          iconName="Star"
          description="Average course rating"
        />
        <StatsCard
          title="Revenue"
          value={`$${stats?.totalRevenue?.toFixed(2) ?? "0.00"}`}
          iconName="DollarSign"
          description="Total earnings"
        />
      </div>
    </div>
  );
};

export default InstructorDashboardPage;
