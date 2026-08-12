"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getQuizById,
  getQuizForTake,
  startAttempt,
  submitAttempt,
} from "@/services/quiz.services";
import { IQuizQuestion } from "@/types/quiz.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, Flag } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props {
  params: Promise<{ courseId: string; quizId: string }>;
}

interface QuizTakeData {
  title: string;
  questions: IQuizQuestion[];
  timeLimit?: number;
}

const TakeQuizPage = ({ params }: Props) => {
  const searchParams = useSearchParams();
  const [courseId, setCourseId] = useState("");
  const [quizId, setQuizId] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(
    searchParams.get("attemptId"),
  );
  useEffect(() => {
    params.then((p) => {
      setCourseId(p.courseId);
      setQuizId(p.quizId);
    });
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["quiz-take", courseId, quizId],
    queryFn: () => getQuizForTake(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });

  const { data: quizData } = useQuery({
    queryKey: ["quiz", courseId, quizId],
    queryFn: () => getQuizById(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });

  const takeData = data?.data as unknown as QuizTakeData | undefined;
  const questions = takeData?.questions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const timeLimit = quizData?.data?.timeLimit ?? takeData?.timeLimit;

  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    if (timeLimit && timeLimit > 0 && !timerRef.current) {
      setTimeLeft(timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            timerRef.current = null;
            if (attemptId && !autoSubmittedRef.current) {
              autoSubmittedRef.current = true;
              submitMutation.mutate();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLimit, attemptId]);

  const answeredCount = Object.keys(answers).length;

  const [starting, setStarting] = useState(!searchParams.get("attemptId"));

  useEffect(() => {
    if (!quizId || attemptId) return;
    let cancelled = false;
    startAttempt(quizId)
      .then((res) => {
        if (cancelled) return;
        if (res.success) {
          setAttemptId(res.data.id);
        } else {
          toast.error(res.message || "Failed to start quiz");
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to start quiz");
      })
      .finally(() => {
        if (!cancelled) setStarting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quizId, attemptId]);

  const submitMutation = useMutation({
    mutationFn: () =>
      submitAttempt(attemptId!, {
        answers: Object.entries(answersRef.current).map(
          ([questionId, selectedAnswer]) => ({ questionId, selectedAnswer }),
        ),
      }),
    onSuccess: (res) => {
      toast.success(res.success ? "Quiz submitted!" : "Submission failed");
    },
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) return <Skeleton className="h-64 rounded-3xl" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-mute-text">
            Quiz
          </p>
          <h1 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
            {takeData?.title ?? "Quiz"}
          </h1>
        </div>
        {timeLimit && timeLimit > 0 && (
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
              timeLeft < 60
                ? "bg-negative/10 text-negative"
                : "bg-canvas-soft text-ink"
            }`}
          >
            <Clock className="size-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-white p-6 ring-1 ring-border">
        <div className="flex items-center gap-2 text-sm font-medium text-body-text">
          <Flag className="size-4 text-ink-deep" />
          <span>
            {answeredCount} of {questions.length} answered
          </span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-canvas-soft">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="rounded-3xl border border-dashed p-12 text-center text-mute-text">
          No questions available
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => {
            const isAnswered = Boolean(answers[q.id]);
            return (
              <Card
                key={q.id}
                className={`ring-1 ${
                  isAnswered ? "ring-primary/40" : "ring-border"
                }`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <CardTitle className="text-lg leading-snug">
                    <span className="mr-2 inline-flex size-7 items-center justify-center rounded-full bg-primary-pale text-sm font-extrabold text-ink-deep">
                      {i + 1}
                    </span>
                    {q.question}
                  </CardTitle>
                  {isAnswered && (
                    <CheckCircle2 className="mt-1 size-5 shrink-0 text-positive" />
                  )}
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[q.id] || ""}
                    onValueChange={(v) =>
                      setAnswers({ ...answers, [q.id]: v })
                    }
                    className="space-y-2"
                  >
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <div
                          key={opt}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
                            isSelected
                              ? "border-primary bg-primary-pale"
                              : "border-border hover:bg-canvas-soft/60"
                          }`}
                        >
                          <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                          <Label
                            htmlFor={`${q.id}-${opt}`}
                            className="cursor-pointer text-sm font-medium text-ink"
                          >
                            {opt}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex items-center justify-end gap-3">
            <p className="text-sm text-mute-text">
              {questions.length - answeredCount} left
            </p>
            <Button
              className="rounded-full px-8"
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || starting || !attemptId}
            >
              {submitMutation.isPending
                ? "Submitting..."
                : starting
                  ? "Starting..."
                  : "Submit answers"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuizPage;
