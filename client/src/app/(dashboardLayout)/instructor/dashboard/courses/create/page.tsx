"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createCourse } from "@/services/course.services";
import { ICreateCoursePayload } from "@/types/course.types";
import { createCourseZodSchema } from "@/zod/course.validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ZodError } from "zod";

const CreateCoursePage = () => {
  const router = useRouter();
  const [form, setForm] = useState<ICreateCoursePayload>({
    title: "", description: "", price: 0,
    level: "BEGINNER", language: "English", categoryId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: ICreateCoursePayload) => createCourse(payload),
    onSuccess: (res) => {
      if (res.success) { toast.success("Course created"); router.push("/instructor/dashboard/courses"); }
      else { toast.error(res.message); }
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

  const fieldError = (field: string) => errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Create Course</h1>
        <p className="text-sm text-muted-foreground">Fill in the details for your new course</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
              {fieldError("title")}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input id="price" type="number" min="0" step="0.01" value={form.price || 0} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                {fieldError("price")}
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={form.level} onValueChange={(v) => v && setForm({ ...form, level: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category ID</Label>
                <Input id="categoryId" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} placeholder="Category ID" />
                {fieldError("categoryId")}
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Course"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateCoursePage;
