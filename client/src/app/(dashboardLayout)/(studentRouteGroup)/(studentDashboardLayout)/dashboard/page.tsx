"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardData } from "@/services/dashboard.services";
import { IStudentDashboardStats } from "@/types/dashboard.types";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, DollarSign, GraduationCap, Trophy } from "lucide-react";

const StudentDashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => getDashboardData(),
  });

  const stats: IStudentDashboardStats | null = data?.data as any;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Dashboard</h1>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
              <GraduationCap className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats?.totalEnrollments ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Bookmark className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats?.inProgressCourses ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats?.completedCourses ?? 0}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Spent</CardTitle>
              <DollarSign className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">${stats?.totalSpent?.toFixed(2) ?? "0.00"}</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentDashboardPage;
