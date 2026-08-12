"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizzesByCourse } from "@/services/quiz.services";
import { IQuiz } from "@/types/quiz.types";
import { useQuery } from "@tanstack/react-query";
import { Gauge, HelpCircle, Pencil, Plus, Repeat, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import EmptyState from "@/components/shared/EmptyState";

interface Props {
  params: Promise<{ courseId: string }>;
}

const CourseQuizzesPage = ({ params }: Props) => {
  const [courseId, setCourseId] = useState("");
  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: () => getQuizzesByCourse(courseId),
    enabled: !!courseId,
  });

  const quizzes: IQuiz[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-black tracking-tight text-ink">
            Quizzes
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Assess your students with quizzes.
          </p>
        </div>
        <Button className="gap-2 rounded-full" asChild>
          <Link href={`/instructor/dashboard/courses/${courseId}/quizzes/create`}>
            <Plus className="size-4" />
            Add quiz
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No quizzes yet"
          description="Add a quiz to test what your students have learned."
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="flex flex-col rounded-3xl bg-white p-6 ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:shadow-primary-pale"
            >
              <div className="flex flex-1 items-start gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-pale">
                  <HelpCircle className="size-5 text-ink-deep" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-lg font-bold text-ink">
                    {q.title}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-mute-text">
                    <span className="flex items-center gap-1">
                      <Timer className="size-3.5" />
                      {q.timeLimit ? `${q.timeLimit} min` : "No limit"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge className="size-3.5" />
                      Pass: {q.passingScore}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat className="size-3.5" />
                      {q.maxAttempts} attempts
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/instructor/dashboard/courses/${courseId}/quizzes/${q.id}/edit`}
                className="mt-4 mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary-deep"
              >
                <Pencil className="size-3.5" />
                Edit quiz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzesPage;
