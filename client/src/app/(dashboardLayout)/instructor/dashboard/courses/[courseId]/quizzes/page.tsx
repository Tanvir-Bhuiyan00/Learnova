"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getQuizzesByCourse } from "@/services/quiz.services";
import { IQuiz } from "@/types/quiz.types";
import { useQuery } from "@tanstack/react-query";
import { HelpCircle, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface Props { params: Promise<{ courseId: string }> }

const CourseQuizzesPage = ({ params }: Props) => {
  const [courseId, setCourseId] = useState("");
  useEffect(() => { params.then((p) => setCourseId(p.courseId)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["course-quizzes", courseId],
    queryFn: () => getQuizzesByCourse(courseId),
    enabled: !!courseId,
  });

  const quizzes: IQuiz[] = data?.data ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Button><Plus className="mr-2 size-4" />Add Quiz</Button>
      </div>
      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
      ) : quizzes.length === 0 ? (
        <Card><CardContent className="flex flex-col items-center py-12">
          <HelpCircle className="mb-4 size-12 text-muted-foreground" />
          <p className="text-lg font-medium">No quizzes yet</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((q) => (
            <Card key={q.id}><CardHeader><CardTitle className="text-base">{q.title}</CardTitle></CardHeader></Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseQuizzesPage;
