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
import { createAssignment } from "@/services/assignment.services";
import { getCourses } from "@/services/course.services";
import { ICreateAssignmentPayload } from "@/types/assignment.types";
import { ICourse } from "@/types/course.types";
import { createAssignmentZodSchema } from "@/zod/assignment.validation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, ClipboardList, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const inputClass =
  "rounded-xl border-border bg-canvas-soft/50 focus-visible:bg-white";

const CreateAssignmentPage = () => {
  const router = useRouter();
  const [form, setForm] = useState<ICreateAssignmentPayload>({
    courseId: "",
    title: "",
    description: "",
    instructions: "",
    dueDate: "",
    totalMarks: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses", "", "all", "all", "newest", false, 1],
    queryFn: () => getCourses("page=1&limit=50&status=PUBLISHED"),
  });

  const courses: ICourse[] = coursesData?.data ?? [];

  const fieldError = (field: string) =>
    errors[field] && (
      <p className="mt-1 text-xs font-medium text-negative">{errors[field]}</p>
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload: ICreateAssignmentPayload = {
      ...form,
      totalMarks: Number(form.totalMarks),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    };

    const result = createAssignmentZodSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSaving(true);
    try {
      await createAssignment(payload);
      toast.success("Assignment created");
      router.push("/instructor/dashboard/assignments");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not create assignment";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/instructor/dashboard/assignments"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-body-text transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to assignments
        </Link>
        <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-ink">
          Create assignment
        </h1>
        <p className="mt-1 text-sm text-mute-text">
          Give your students a hands-on task to demonstrate what they&apos;ve
          learned.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl bg-white p-8 ring-1 ring-border"
      >
        <div className="space-y-2">
          <Label htmlFor="courseId">Course</Label>
          <Select
            value={form.courseId}
            onValueChange={(value) => {
              if (value) setForm({ ...form, courseId: value });
            }}
          >
            <SelectTrigger id="courseId" className={inputClass}>
              <SelectValue
                placeholder={
                  coursesLoading ? "Loading courses..." : "Select a course"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError("courseId")}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Assignment title</Label>
          <Input
            id="title"
            placeholder="e.g. Build a REST API with Express"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
          {fieldError("title")}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total marks</Label>
            <Input
              id="totalMarks"
              type="number"
              min={1}
              value={form.totalMarks}
              onChange={(e) =>
                setForm({ ...form, totalMarks: Number(e.target.value) })
              }
              className={inputClass}
            />
            {fieldError("totalMarks")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date (optional)</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mute-text" />
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate?.slice(0, 10) ?? ""}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="What is this assignment about?"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions (optional)</Label>
          <Textarea
            id="instructions"
            rows={4}
            placeholder="Steps, resources, or expectations for students..."
            value={form.instructions ?? ""}
            onChange={(e) =>
              setForm({ ...form, instructions: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3 border-t border-canvas-soft pt-6">
          <Button type="submit" disabled={saving} className="rounded-full">
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ClipboardList className="size-4" />
            )}
            {saving ? "Creating..." : "Create assignment"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/instructor/dashboard/assignments")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateAssignmentPage;
