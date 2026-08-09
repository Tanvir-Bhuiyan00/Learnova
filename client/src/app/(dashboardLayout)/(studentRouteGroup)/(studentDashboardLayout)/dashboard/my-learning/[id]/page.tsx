"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyEnrollmentById } from "@/services/enrollment.services";
import { IEnrollment } from "@/types/enrollment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props { params: Promise<{ id: string }> }

const MyLearningDetailPage = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollment", id],
    queryFn: () => getMyEnrollmentById(id),
    enabled: !!id,
  });

  const enrollment: IEnrollment | null = data?.data ?? null;

  return (
    <div className="space-y-6 p-6">
      <Link href="/dashboard/my-learning" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 size-4" /> Back to My Learning
      </Link>
      {isLoading ? <Skeleton className="h-48" /> : !enrollment ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Enrollment not found</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Course Details</CardTitle>
            <p className="text-sm text-muted-foreground">Enrolled on {new Date(enrollment.createdAt).toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Progress:</span>
              <div className="h-2 flex-1 rounded-full bg-secondary">
                <div className="h-full rounded-full bg-primary" style={{ width: `${enrollment.progress}%` }} />
              </div>
              <span className="text-sm">{enrollment.progress}%</span>
            </div>
            <p className="text-sm">Status: {enrollment.isCompleted ? "Completed" : "In Progress"}</p>
            <Link href={`/dashboard/courses/${enrollment.courseId}/learn`}>
              <span className="text-sm text-primary underline">Continue Learning</span>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyLearningDetailPage;
