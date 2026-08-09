"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyEnrollments } from "@/services/enrollment.services";
import { IEnrollment } from "@/types/enrollment.types";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const MyLearningPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => getMyEnrollments(),
  });

  const enrollments: IEnrollment[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">My Learning</h1>
        <p className="text-sm text-muted-foreground">Your enrolled courses</p>
      </div>
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : enrollments.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <BookOpen className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No enrollments yet</p>
          <p className="text-sm text-muted-foreground">Browse courses and start learning.</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr) => (
            <Link key={enr.id} href={`/dashboard/courses/${enr.courseId}/learn`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Course</CardTitle>
                    <Badge variant={enr.isCompleted ? "default" : "secondary"}>{enr.isCompleted ? "Completed" : "In Progress"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Course ID: {enr.courseId.slice(0, 8)}...</p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
