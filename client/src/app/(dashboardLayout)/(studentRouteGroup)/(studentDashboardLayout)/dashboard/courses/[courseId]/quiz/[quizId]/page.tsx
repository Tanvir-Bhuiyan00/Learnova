"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizById, startAttempt } from "@/services/quiz.services";
import { IQuiz } from "@/types/quiz.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  Gauge,
  HelpCircle,
  Repeat,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  params: Promise<{ courseId: string; quizId: string }>;
}

const QuizDetailPage = ({ params }: Props) => {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [quizId, setQuizId] = useState("");
  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setQuizId(p.quizId);
    });
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["quiz", courseId, quizId],
    queryFn: () => getQuizById(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });

  const quiz: IQuiz | null = data?.data ?? null;

  const startMutation = useMutation({
    mutationFn: () => startAttempt(quizId),
    onSuccess: (res) => {
      if (res.success) {
        router.push(
          `/dashboard/courses/${courseId}/quiz/${quizId}/take?attemptId=${res.data.id}`,
        );
      } else {
        toast.error(res.message || "Failed to start quiz");
      }
    },
  });

  const infoItems = [
    {
      icon: Clock,
      label: "Time limit",
      value: quiz?.timeLimit ? `${quiz.timeLimit} min` : "No limit",
    },
    {
      icon: Gauge,
      label: "Passing score",
      value: `${quiz?.passingScore}%`,
    },
    {
      icon: Repeat,
      label: "Max attempts",
      value: `${quiz?.maxAttempts}`,
    },
    {
      icon: Tag,
      label: "Type",
      value: `${quiz?.category}`,
    },
  ];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href={`/dashboard/courses/${courseId}/learn`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to course
      </Link>

      {isLoading ? (
        <Skeleton className="h-80 rounded-3xl" />
      ) : !quiz ? (
        <div className="rounded-3xl border border-dashed p-12 text-center text-mute-text">
          Quiz not found
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="bg-canvas-soft/70 p-8">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
                <HelpCircle className="size-6 text-ink" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-mute-text">
                  Quiz
                </p>
                <h1 className="font-heading text-2xl font-extrabold tracking-tight text-ink">
                  {quiz.title}
                </h1>
              </div>
            </div>
            {quiz.description && (
              <p className="mt-4 text-sm leading-relaxed text-body-text">
                {quiz.description}
              </p>
            )}
          </div>

          <CardContent className="space-y-4 p-8">
            <div className="space-y-2.5 rounded-2xl bg-canvas-soft/50 p-5">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2.5 font-medium text-body-text">
                    <item.icon className="size-4 text-mute-text" />
                    {item.label}
                  </span>
                  <span className="font-semibold text-ink">{item.value}</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? "Starting..." : "Start quiz"}
            </Button>
            <p className="text-center text-xs text-mute-text">
              Make sure you have time to finish once you start.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizDetailPage;
