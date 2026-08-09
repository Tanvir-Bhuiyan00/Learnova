"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizById, getQuizForTake, submitAttempt } from "@/services/quiz.services";
import { IQuizQuestion } from "@/types/quiz.types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Clock, Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Props { params: Promise<{ courseId: string; quizId: string }> }

interface QuizTakeData { title: string; questions: IQuizQuestion[]; timeLimit?: number }

const TakeQuizPage = ({ params }: Props) => {
  const [courseId, setCourseId] = useState("");
  const [quizId, setQuizId] = useState("");
  useEffect(() => { params.then((p) => { setCourseId(p.courseId); setQuizId(p.quizId); }); }, [params]);

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
  const timeLimit = quizData?.data?.timeLimit ?? takeData?.timeLimit;

  const [timeLeft, setTimeLeft] = useState(timeLimit ? timeLimit * 60 : 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLimit && timeLimit > 0 && !timerRef.current) {
      setTimeLeft(timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLimit]);

  const answeredCount = Object.keys(answers).length;

  const submitMutation = useMutation({
    mutationFn: () => submitAttempt(quizId, { answers: Object.entries(answers).map(([questionId, selectedAnswer]) => ({ questionId, selectedAnswer })) }),
    onSuccess: (res) => { toast.success(res.success ? "Quiz submitted!" : "Submission failed"); },
  });

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (isLoading) return <div className="p-6"><Skeleton className="h-48" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{takeData?.title ?? "Quiz"}</h1>
        {timeLimit && timeLimit > 0 && (
          <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${timeLeft < 60 ? "text-destructive border-destructive" : ""}`}>
            <Clock className="size-4" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Flag className="size-4" />
        <span>{answeredCount} of {questions.length} answered</span>
      </div>

      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }} />
      </div>

      {questions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No questions available</CardContent></Card>
      ) : (
        <div className="space-y-6">
          {questions.map((q, i) => (
            <Card key={q.id} className={answers[q.id] ? "ring-1 ring-primary/20" : ""}>
              <CardHeader><CardTitle className="text-base">{i + 1}. {q.question}</CardTitle></CardHeader>
              <CardContent>
                <RadioGroup value={answers[q.id] || ""} onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}>
                  {q.options.map((opt) => (
                    <div key={opt} className="flex items-center gap-2 py-1">
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <Label htmlFor={`${q.id}-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
          <Button className="w-full" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
            {submitMutation.isPending ? "Submitting..." : "Submit Answers"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TakeQuizPage;
