"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyEnrollments } from "@/services/enrollment.services";
import { IEnrollment } from "@/types/enrollment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";

const MyLearningPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => getMyEnrollments(),
  });

  const enrollments: IEnrollment[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
          My learning
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Pick up where you left off.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-3xl" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrollments yet"
          description="Browse courses and start your first one today."
        >
          <Link href="/courses">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-deep hover:text-ink">
              Browse courses
              <ArrowRight className="size-4" />
            </span>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enr) => (
            <Link
              key={enr.id}
              href={`/dashboard/courses/${enr.courseId}/learn`}
              className="group flex flex-col rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-pale hover:ring-primary/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-pale">
                  <BookOpen className="size-5 text-ink-deep" />
                </div>
                <Badge
                  variant={enr.isCompleted ? "default" : "secondary"}
                  className="rounded-full"
                >
                  {enr.isCompleted ? "Completed" : "In progress"}
                </Badge>
              </div>

              <h3 className="mt-5 font-heading text-lg font-bold text-ink">
                {enr.isCompleted ? "Course completed" : "Course in progress"}
              </h3>
              <p className="mt-1 text-xs text-mute-text">
                Course ID: {enr.courseId.slice(0, 8)}...
              </p>

              <div className="mt-auto pt-6">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-mute-text">Progress</span>
                  <span className="text-ink">{enr.progress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-canvas-soft">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min(100, enr.progress)}%` }}
                  />
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-deep transition-colors group-hover:text-ink">
                  <PlayCircle className="size-4" />
                  {enr.isCompleted ? "Review course" : "Continue learning"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;
