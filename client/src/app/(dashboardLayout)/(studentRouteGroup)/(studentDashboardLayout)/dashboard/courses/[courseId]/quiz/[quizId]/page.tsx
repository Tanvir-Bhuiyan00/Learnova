"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizById, startAttempt } from "@/services/quiz.services";
import { IQuiz } from "@/types/quiz.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Clock, HelpCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props { params: Promise<{ courseId: string; quizId: string }> }

const QuizDetailPage = ({ params }: Props) => {
  const router = useRouter();
  const [courseId, setCourseId] = useState("");
  const [quizId, setQuizId] = useState("");
  useEffect(() => { params.then((p) => { setCourseId(p.courseId); setQuizId(p.quizId); }); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["quiz", courseId, quizId],
    queryFn: () => getQuizById(courseId, quizId),
    enabled: !!courseId && !!quizId,
  });

  const quiz: IQuiz | null = data?.data ?? null;

  const startMutation = useMutation({
    mutationFn: () => startAttempt(quizId),
    onSuccess: (res) => {
      if (res.success) { router.push(`/dashboard/courses/${courseId}/quiz/${quizId}/take`); }
      else { toast.error(res.message || "Failed to start quiz"); }
    },
  });

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <Link href={`/dashboard/courses/${courseId}/learn`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 size-4" /> Back to Course
      </Link>
      {isLoading ? <Skeleton className="h-48" /> : !quiz ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Quiz not found</CardContent></Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="size-5 text-primary" />
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
            </div>
            {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Clock className="size-4 text-muted-foreground" />Time Limit: {quiz.timeLimit ? `${quiz.timeLimit} min` : "No limit"}</div>
              <div className="flex items-center gap-2"><AlertCircle className="size-4 text-muted-foreground" />Passing Score: {quiz.passingScore}%</div>
              <div className="flex items-center gap-2"><AlertCircle className="size-4 text-muted-foreground" />Max Attempts: {quiz.maxAttempts}</div>
              <div className="flex items-center gap-2"><AlertCircle className="size-4 text-muted-foreground" />Type: {quiz.category}</div>
            </div>
            <Button className="w-full" onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              {startMutation.isPending ? "Starting..." : "Start Quiz"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizDetailPage;
