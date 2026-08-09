"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { createCourse } from "@/services/course.services";
import { ICreateCoursePayload } from "@/types/course.types";
import { createCourseZodSchema } from "@/zod/course.validation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

const CreateCoursePage = () => {
  const router = useRouter();
  const [form, setForm] = useState<ICreateCoursePayload>({
    title: "",
    description: "",
    price: 0,
    level: "BEGINNER",
    language: "English",
    categoryId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: ICreateCoursePayload) => createCourse(payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Course created");
        router.push("/instructor/dashboard/courses");
      } else {
        toast.error(res.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = createCourseZodSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate(form);
  };

  const fieldError = (field: string) =>
    errors[field] && (
      <p className="mt-1 text-xs font-medium text-negative">{errors[field]}</p>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-mute-text">
            Instructor studio
          </p>
          <h1 className="mt-1 font-heading text-3xl font-black tracking-tight text-ink">
            Create course
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Fill in the details for your new course.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2 rounded-full"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="ring-1 ring-border">
          <div className="flex items-center gap-3 border-b border-canvas-soft p-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-primary-pale">
              <BookOpen className="size-5 text-ink-deep" />
            </div>
            <h2 className="font-heading text-lg font-bold text-ink">
              Course details
            </h2>
          </div>

          <CardContent className="space-y-5 p-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-xs font-bold uppercase tracking-widest text-mute-text"
              >
                Title
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Course title"
                className={inputClass}
              />
              {fieldError("title")}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-xs font-bold uppercase tracking-widest text-mute-text"
              >
                Description
              </Label>
              <Textarea
                id="description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Course description"
                className={`${inputClass} rounded-2xl`}
                rows={4}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-xs font-bold uppercase tracking-widest text-mute-text"
                >
                  Price ($)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price || 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className={inputClass}
                />
                {fieldError("price")}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-mute-text">
                  Level
                </Label>
                <Select
                  value={form.level}
                  onValueChange={(v) =>
                    v && setForm({ ...form, level: v as any })
                  }
                >
                  <SelectTrigger className="rounded-xl border-border bg-canvas-soft/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="language"
                  className="text-xs font-bold uppercase tracking-widest text-mute-text"
                >
                  Language
                </Label>
                <Input
                  id="language"
                  value={form.language}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="categoryId"
                  className="text-xs font-bold uppercase tracking-widest text-mute-text"
                >
                  Category ID
                </Label>
                <Input
                  id="categoryId"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  placeholder="Category ID"
                  className={inputClass}
                />
                {fieldError("categoryId")}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-full sm:w-auto"
              size="lg"
              disabled={mutation.isPending}
            >
              <Save className="size-4" />
              {mutation.isPending ? "Creating..." : "Create course"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateCoursePage;
