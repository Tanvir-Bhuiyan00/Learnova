"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addQuestion,
  deleteQuestion,
  updateQuestion,
} from "@/services/quiz.services";
import {
  IAddQuestionPayload,
  IQuizQuestion,
  IUpdateQuestionPayload,
} from "@/types/quiz.types";
import {
  Check,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

interface QuizQuestionBuilderProps {
  quizId: string;
  initialQuestions?: IQuizQuestion[];
}

interface DraftQuestion {
  question: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: string;
}

const toDraft = (q: IQuizQuestion): DraftQuestion => ({
  question: q.question,
  questionType: q.questionType,
  options: [...q.options],
  correctAnswer: q.correctAnswer,
});

const emptyQuestion = (): DraftQuestion => ({
  question: "",
  questionType: "MULTIPLE_CHOICE",
  options: ["", "", "", ""],
  correctAnswer: "",
});

export function QuizQuestionBuilder({
  quizId,
  initialQuestions = [],
}: QuizQuestionBuilderProps) {
  const [questions, setQuestions] = useState<IQuizQuestion[]>(initialQuestions);
  const [current, setCurrent] = useState<DraftQuestion | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const startNew = () => {
    setCurrent(emptyQuestion());
    setEditingId(null);
    setAdding(true);
  };

  const startEdit = (question: IQuizQuestion) => {
    setCurrent(toDraft(question));
    setEditingId(question.id);
    setAdding(true);
  };

  const setOption = (index: number, value: string) => {
    if (!current) return;
    const options = [...current.options];
    options[index] = value;
    setCurrent({ ...current, options });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;

    const options =
      current.questionType === "MULTIPLE_CHOICE"
        ? current.options.filter((option) => option.trim() !== "")
        : current.questionType === "TRUE_FALSE"
          ? ["True", "False"]
          : [];

    if (!current.question.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (!current.correctAnswer.trim()) {
      toast.error("Please set the correct answer");
      return;
    }
    if (
      current.questionType === "MULTIPLE_CHOICE" &&
      options.length < 2
    ) {
      toast.error("Multiple choice questions need at least 2 options");
      return;
    }

    setBusy("save");
    try {
      if (editingId) {
        const payload: IUpdateQuestionPayload = {
          question: current.question,
          questionType: current.questionType,
          options,
          correctAnswer: current.correctAnswer,
        };
        await updateQuestion(quizId, editingId, payload);
        setQuestions((prev) =>
          prev.map((q) => (q.id === editingId ? { ...q, ...payload } : q)),
        );
        toast.success("Question updated");
      } else {
        const payload: IAddQuestionPayload = {
          question: current.question,
          questionType: current.questionType,
          options,
          correctAnswer: current.correctAnswer,
          order: questions.length + 1,
        };
        const res = await addQuestion(quizId, payload);
        setQuestions((prev) => [...prev, res.data]);
        toast.success("Question added");
      }
      setCurrent(null);
      setEditingId(null);
      setAdding(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not save question",
      );
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (questionId: string) => {
    setBusy(questionId);
    try {
      await deleteQuestion(quizId, questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success("Question deleted");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Could not delete question",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-ink">Questions</h2>
          <p className="mt-0.5 text-sm text-mute-text">
            {questions.length}{" "}
            {questions.length === 1 ? "question" : "questions"} in this quiz
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={startNew}
        >
          <Plus className="size-4" />
          Add question
        </Button>
      </div>

      {questions.length > 0 && (
        <ul className="space-y-3">
          {questions.map((q, index) => (
            <li
              key={q.id}
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
                onClick={() => startEdit(q)}
                className="cursor-pointer text-xs font-semibold text-primary hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(q.id)}
                disabled={busy === q.id}
                className="cursor-pointer text-mute-text transition-colors hover:text-negative disabled:opacity-50"
                aria-label="Delete question"
              >
                {busy === q.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {current && (
        <form
          onSubmit={handleSave}
          className="space-y-5 rounded-2xl border border-primary/30 bg-primary-pale/40 p-6"
        >
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
              {(
                ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"] as QuestionType[]
              ).map((type) => (
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
              ))}
            </div>
          </div>

          {current.questionType === "MULTIPLE_CHOICE" && (
            <div className="space-y-3">
              <Label>Options — click to mark the correct answer</Label>
              {current.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrent({ ...current, correctAnswer: option })
                    }
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
            <Button type="submit" disabled={busy === "save"} className="rounded-full">
              {busy === "save" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : editingId ? (
                <Save className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}
              {editingId ? "Save changes" : "Add question"}
            </Button>
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setCurrent(null);
                setAdding(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!current && !adding && questions.length > 0 && (
        <Button variant="outline" className="gap-2 rounded-full" onClick={startNew}>
          <Plus className="size-4" />
          Add another question
        </Button>
      )}
    </div>
  );
}