"use client";

import { Skeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/shared/StatsCard";
import { Button } from "@/components/ui/button";
import { getDashboardData } from "@/services/dashboard.services";
import { IStudentDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";

const StudentDashboardPage = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => getDashboardData(),
  });

  const stats: IStudentDashboardStats | null = data?.data as any;

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
          My dashboard
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Your learning progress at a glance.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Enrolled"
            value={stats?.totalEnrollments ?? 0}
            iconName="GraduationCap"
            description="Courses you have joined"
          />
          <StatsCard
            title="In Progress"
            value={stats?.inProgressCourses ?? 0}
            iconName="Bookmark"
            description="Courses currently learning"
          />
          <StatsCard
            title="Completed"
            value={stats?.completedCourses ?? 0}
            iconName="Trophy"
            description="Courses you have finished"
          />
          <StatsCard
            title="Spent"
            value={`$${stats?.totalSpent?.toFixed(2) ?? "0.00"}`}
            iconName="DollarSign"
            description="Total amount invested"
          />
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
