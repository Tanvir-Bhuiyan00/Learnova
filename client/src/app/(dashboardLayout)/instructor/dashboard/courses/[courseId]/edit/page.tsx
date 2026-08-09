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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCourseById, updateCourse } from "@/services/course.services";
import { IUpdateCoursePayload } from "@/types/course.types";
import { updateCourseZodSchema } from "@/zod/course.validation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, ListTree, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>;
}

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

const EditCoursePage = ({ params }: EditCoursePageProps) => {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [form, setForm] = useState<IUpdateCoursePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    params.then((p) => setCourseId(p.courseId));
  }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  useEffect(() => {
    const course = data?.data;
    if (course) {
      setForm({
        title: course.title,
        description: course.description || "",
        price: course.price,
        level: course.level,
        language: course.language,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: IUpdateCoursePayload) =>
      updateCourse(courseId, payload),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Course updated");
        router.push("/instructor/dashboard/courses");
      } else {
        toast.error(res.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = updateCourseZodSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    mutation.mutate(result.data);
  };

  const fieldError = (field: string) =>
    errors[field] && (
      <p className="mt-1 text-xs font-medium text-negative">{errors[field]}</p>
    );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/instructor/dashboard/courses"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Back to courses
          </Link>
          <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-ink">
            Edit course
          </h1>
          <p className="mt-1 text-sm text-mute-text">
            Update the details of your course.
          </p>
        </div>
        <Link
          href={`/instructor/dashboard/courses/${courseId}/curriculum`}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-canvas-soft"
        >
          <ListTree className="size-4" />
          Manage curriculum
        </Link>
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
              <Label className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Title
              </Label>
              <Input
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputClass}
              />
              {fieldError("title")}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-mute-text">
                Description
              </Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className={`${inputClass} rounded-2xl`}
                rows={4}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-mute-text">
                  Price ($)
                </Label>
                <Input
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
                  Status
                </Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    v && setForm({ ...form, status: v as any })
                  }
                >
                  <SelectTrigger className="rounded-xl border-border bg-canvas-soft/50">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
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
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-mute-text">
                  Language
                </Label>
                <Input
                  value={form.language || ""}
                  onChange={(e) =>
                    setForm({ ...form, language: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                className="gap-2 rounded-full"
                size="lg"
                disabled={mutation.isPending}
              >
                <Save className="size-4" />
                {mutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                size="lg"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditCoursePage;
