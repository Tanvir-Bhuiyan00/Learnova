"use client";

import { QuizQuestionBuilder } from "@/components/modules/Instructor/QuizQuestionBuilder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getQuizById, updateQuiz } from "@/services/quiz.services";
import { IQuiz } from "@/types/quiz.types";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

const QUIZ_CATEGORIES = ["MCQ", "TRUE_FALSE", "SHORT_QUESTION"] as const;

export default function EditQuizPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<IQuiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "MCQ" as IQuiz["category"],
    passingScore: 70,
    maxAttempts: 1,
    timeLimit: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getQuizById(params.courseId, params.quizId);
        const q = res.data;
        setQuiz(q);
        setForm({
          title: q.title,
          description: q.description ?? "",
          category: q.category,
          passingScore: q.passingScore,
          maxAttempts: q.maxAttempts,
          timeLimit: q.timeLimit ? String(q.timeLimit) : "",
        });
      } catch (error: unknown) {
        toast.error(
          error instanceof Error ? error.message : "Could not load quiz",
        );
        router.push(`/instructor/dashboard/courses/${params.courseId}/quizzes`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.courseId, params.quizId, router]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Quiz title is required");
      return;
    }
    setSaving(true);
    try {
      await updateQuiz(params.courseId, params.quizId, {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        passingScore: form.passingScore,
        maxAttempts: form.maxAttempts,
        timeLimit: form.timeLimit ? Number(form.timeLimit) : undefined,
      });
      toast.success("Quiz updated");
      router.push(`/instructor/dashboard/courses/${params.courseId}/quizzes`);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not save quiz",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Link
        href={`/instructor/dashboard/courses/${params.courseId}/quizzes`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-mute-text transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to quizzes
      </Link>

      <div>
        <h1 className="font-heading text-3xl font-bold text-ink">Edit quiz</h1>
        <p className="mt-1 text-sm text-mute-text">
          Update the quiz settings and manage its questions.
        </p>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="space-y-5 rounded-3xl bg-card p-8 ring-1 ring-border"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz title</Label>
            <Input
              id="title"
              placeholder="e.g. Chapter 1: React Basics"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={form.category}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as IQuiz["category"],
                })
              }
              className={`${inputClass} w-full py-2.5`}
            >
              {QUIZ_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="What does this quiz cover?"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="passingScore">Passing score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min={0}
              max={100}
              value={form.passingScore}
              onChange={(e) =>
                setForm({ ...form, passingScore: Number(e.target.value) })
              }
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxAttempts">Max attempts</Label>
            <Input
              id="maxAttempts"
              type="number"
              min={1}
              value={form.maxAttempts}
              onChange={(e) =>
                setForm({ ...form, maxAttempts: Number(e.target.value) })
              }
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={1}
              placeholder="No limit"
              value={form.timeLimit}
              onChange={(e) => setForm({ ...form, timeLimit: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-canvas-soft pt-5">
          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save quiz settings
          </Button>
          <Button
            variant="ghost"
            type="button"
            onClick={() =>
              router.push(
                `/instructor/dashboard/courses/${params.courseId}/quizzes`,
              )
            }
          >
            Cancel
          </Button>
        </div>
      </form>

      <QuizQuestionBuilder
        quizId={params.quizId}
        initialQuestions={quiz.questions ?? []}
      />
    </div>
  );
}