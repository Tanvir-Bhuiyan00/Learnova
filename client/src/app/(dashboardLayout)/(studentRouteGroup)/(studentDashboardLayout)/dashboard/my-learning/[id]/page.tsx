"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyEnrollmentById } from "@/services/enrollment.services";
import { IEnrollment } from "@/types/enrollment.types";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, PlayCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

const MyLearningDetailPage = ({ params }: Props) => {
  const [id, setId] = useState("");
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["my-enrollment", id],
    queryFn: () => getMyEnrollmentById(id),
    enabled: !!id,
  });

  const enrollment: IEnrollment | null = data?.data ?? null;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/my-learning"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to My Learning
      </Link>

      {isLoading ? (
        <Skeleton className="h-64 rounded-3xl" />
      ) : !enrollment ? (
        <div className="rounded-3xl border border-dashed p-12 text-center text-mute-text">
          Enrollment not found
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-border">
          <div className="flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-3xl bg-primary-pale">
                <BookOpen className="size-8 text-ink-deep" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-mute-text">
                  Enrolled on{" "}
                  {new Date(enrollment.createdAt).toLocaleDateString()}
                </p>
                <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
                  {enrollment.isCompleted ? "Course completed" : "Course in progress"}
                </h1>
                <p className="mt-1 text-sm text-mute-text">
                  Course ID: {enrollment.courseId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 rounded-3xl bg-canvas-soft/60 px-8 py-6">
              {enrollment.isCompleted ? (
                <Trophy className="size-8 text-warning-deep" />
              ) : (
                <PlayCircle className="size-8 text-ink-deep" />
              )}
              <div className="text-center">
                <p className="font-heading text-3xl font-black text-ink">
                  {enrollment.progress}%
                </p>
                <p className="text-xs text-mute-text">progress</p>
              </div>
            </div>
          </div>

          <div className="border-t border-canvas-soft p-8 pt-6">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-mute-text">Overall progress</span>
              <span className="text-ink">{enrollment.progress}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(100, enrollment.progress)}%` }}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/dashboard/courses/${enrollment.courseId}/learn`}>
                <Button className="gap-2 rounded-full">
                  {enrollment.isCompleted ? "Review course" : "Continue learning"}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              {enrollment.isCompleted && enrollment.completedAt && (
                <p className="self-center text-sm text-mute-text">
                  Completed on{" "}
                  {new Date(enrollment.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningDetailPage;
