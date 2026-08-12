"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addQuestion, createQuiz } from "@/services/quiz.services";
import { IAddQuestionPayload, ICreateQuizPayload } from "@/types/quiz.types";
import { createQuizZodSchema } from "@/zod/quiz.validation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  HelpCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
type QuizCategory = "MCQ" | "TRUE_FALSE" | "SHORT_QUESTION";

interface DraftQuestion {
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
}

const emptyQuestion = (): DraftQuestion => ({
  question: "",
  questionType: "MULTIPLE_CHOICE",
  options: ["", "", "", ""],
  correctAnswer: "",
});

const CreateQuizPage = () => {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [form, setForm] = useState<ICreateQuizPayload>({
    title: "",
    description: "",
    category: "MCQ",
    passingScore: 80,
    maxAttempts: 1,
    timeLimit: 15,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [current, setCurrent] = useState<DraftQuestion | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  useEffect(() => {
    if (editingIndex !== null && questions[editingIndex]) {
      setCurrent({ ...questions[editingIndex] });
    }
  }, [editingIndex, questions]);

  const fieldError = (field: string) =>
    errors[field] && (
      <p className="mt-1 text-xs font-medium text-negative">{errors[field]}</p>
    );

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = createQuizZodSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSavingQuiz(true);
    try {
      const res = await createQuiz(courseId, form);
      setQuizId(res.data.id);
      setCurrent(emptyQuestion());
      setEditingIndex(questions.length);
      toast.success("Quiz created — now add your questions");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not create quiz",
      );
    } finally {
      setSavingQuiz(false);
    }
  };

  const setOption = (index: number, value: string) => {
    if (!current) return;
    const options = [...current.options];
    options[index] = value;
    setCurrent({ ...current, options });
  };

  const toggleCorrectOption = (value: string) => {
    if (!current) return;
    setCurrent({ ...current, correctAnswer: value });
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !quizId) return;

    const options =
      current.questionType === "MULTIPLE_CHOICE"
        ? current.options.filter((option) => option.trim() !== "")
        : [];

    const payload: IAddQuestionPayload = {
      question: current.question,
      questionType: current.questionType,
      options,
      correctAnswer: current.correctAnswer,
      order: questions.length + 1,
    };

    if (!payload.question.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (!payload.correctAnswer.trim()) {
      toast.error("Please set the correct answer");
      return;
    }
    if (
      payload.questionType === "MULTIPLE_CHOICE" &&
      options.length < 2
    ) {
      toast.error("Multiple choice questions need at least 2 options");
      return;
    }

    setSavingQuestion(true);
    try {
      await addQuestion(quizId, payload);
      setQuestions((prev) => {
        const next = [...prev];
        if (editingIndex !== null && next[editingIndex]) {
          next[editingIndex] = current;
        } else {
          next.push(current);
        }
        return next;
      });
      setCurrent(emptyQuestion());
      setEditingIndex(null);
      toast.success("Question added");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not add question",
      );
    } finally {
      setSavingQuestion(false);
    }
  };

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setCurrent({ ...questions[index] });
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    setEditingIndex(null);
    setCurrent(emptyQuestion());
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/instructor/dashboard/courses/${courseId}/quizzes`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to quizzes
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-ink">
          Create quiz
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Build a quiz to assess your students — then add questions.
        </p>
      </div>

      {/* Step 1 — quiz settings */}
      <form
        onSubmit={handleCreateQuiz}
        className="space-y-6 rounded-3xl bg-white p-8 ring-1 ring-border"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Quiz title</Label>
          <Input
            id="title"
            placeholder="e.g. JavaScript Fundamentals Quiz"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
          {fieldError("title")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="A short intro for your students..."
            value={form.description ?? ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Question type</Label>
            <Select
              value={form.category}
              onValueChange={(value) => {
                if (value) setForm({ ...form, category: value as QuizCategory });
              }}
            >
              <SelectTrigger id="category" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MCQ">Multiple choice (MCQ)</SelectItem>
                <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                <SelectItem value="SHORT_QUESTION">
                  Short question
                </SelectItem>
              </SelectContent>
            </Select>
            {fieldError("category")}
          </div>

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
            {fieldError("passingScore")}
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
            {fieldError("maxAttempts")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={1}
              value={form.timeLimit ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  timeLimit: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className={inputClass}
            />
            {fieldError("timeLimit")}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-canvas-soft pt-6">
          <Button type="submit" disabled={savingQuiz} className="rounded-full">
            {savingQuiz ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <HelpCircle className="size-4" />
            )}
            {quizId ? "Update quiz settings" : "Create quiz"}
          </Button>
        </div>
      </form>

      {/* Step 2 — questions */}
      {quizId && (
        <div className="space-y-6 rounded-3xl bg-white p-8 ring-1 ring-border">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-bold text-ink">
              Questions
            </h2>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => {
                setEditingIndex(null);
                setCurrent(emptyQuestion());
              }}
            >
              <Plus className="size-4" />
              New question
            </Button>
          </div>

          {questions.length > 0 && (
            <ul className="space-y-3">
              {questions.map((q, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 rounded-2xl border border-canvas-soft bg-card px-4 py-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-pale text-xs font-bold text-ink-deep">
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-sm font-medium text-ink">
                    {q.question}
                  </span>
                  <span className="rounded-full bg-canvas-soft px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mute-text">
                    {q.questionType.replace("_", " ")}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEdit(index)}
                    className="cursor-pointer text-xs font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="cursor-pointer text-mute-text transition-colors hover:text-negative"
                    aria-label="Remove question"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {current && (
            <form
              onSubmit={handleAddQuestion}
              className="space-y-5 rounded-2xl border border-primary/30 bg-primary-pale/40 p-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">
                  {editingIndex !== null
                    ? `Edit question ${editingIndex + 1}`
                    : "New question"}
                </h3>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(null);
                      setCurrent(emptyQuestion());
                    }}
                    className="cursor-pointer text-xs font-semibold text-mute-text hover:text-ink"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  placeholder="e.g. What does 'use strict' do?"
                  value={current.question}
                  onChange={(e) =>
                    setCurrent({ ...current, question: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label>Question type</Label>
                <div className="flex flex-wrap gap-2">
                  {(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"] as QuestionType[]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          const next = { ...current, questionType: type };
                          if (type === "MULTIPLE_CHOICE" && next.options.length === 0) {
                            next.options = ["", "", "", ""];
                          }
                          if (type === "TRUE_FALSE") {
                            next.options = ["True", "False"];
                            if (
                              next.correctAnswer !== "True" &&
                              next.correctAnswer !== "False"
                            ) {
                              next.correctAnswer = "True";
                            }
                          }
                          if (type === "SHORT_ANSWER") {
                            next.options = [];
                          }
                          setCurrent(next);
                        }}
                        className={
                          current.questionType === type
                            ? "rounded-full bg-ink-solid px-4 py-1.5 text-sm font-semibold text-white"
                            : "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-body-text ring-1 ring-border transition-colors hover:bg-canvas-soft"
                        }
                      >
                        {type.replace("_", " ")}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {current.questionType === "MULTIPLE_CHOICE" && (
                <div className="space-y-3">
                  <Label>Options — click to mark the correct answer</Label>
                  {current.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleCorrectOption(option)}
                        className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-colors ${
                          current.correctAnswer === option
                            ? "border-positive bg-positive text-white"
                            : "border-mute-text/40 text-transparent hover:border-positive"
                        }`}
                        aria-label="Mark as correct"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <Input
                        value={option}
                        placeholder={`Option ${optionIndex + 1}`}
                        onChange={(e) => setOption(optionIndex, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}

              {current.questionType === "TRUE_FALSE" && (
                <div className="space-y-2">
                  <Label>Correct answer</Label>
                  <div className="flex gap-2">
                    {["True", "False"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setCurrent({ ...current, correctAnswer: value })
                        }
                        className={
                          current.correctAnswer === value
                            ? "rounded-full bg-positive px-5 py-1.5 text-sm font-semibold text-white"
                            : "rounded-full bg-canvas-soft px-5 py-1.5 text-sm font-medium text-body-text transition-colors hover:bg-primary-pale"
                        }
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {current.questionType === "SHORT_ANSWER" && (
                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Expected answer</Label>
                  <Input
                    id="correctAnswer"
                    placeholder="The expected answer / keyword"
                    value={current.correctAnswer}
                    onChange={(e) =>
                      setCurrent({ ...current, correctAnswer: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 border-t border-primary/20 pt-5">
                <Button
                  type="submit"
                  disabled={savingQuestion}
                  className="rounded-full"
                >
                  {savingQuestion ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                  {editingIndex !== null ? "Save changes" : "Add question"}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => {
                    setCurrent(null);
                    setEditingIndex(null);
                  }}
                >
                  Done
                </Button>
              </div>
            </form>
          )}

          {questions.length > 0 && (
            <Button
              className="w-full rounded-full"
              onClick={() => router.push(`/instructor/dashboard/courses/${courseId}/quizzes`)}
            >
              Finish — back to quizzes
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateQuizPage;
