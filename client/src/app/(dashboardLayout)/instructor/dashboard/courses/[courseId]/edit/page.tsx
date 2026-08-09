"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getCourseById, updateCourse } from "@/services/course.services";
import { IUpdateCoursePayload } from "@/types/course.types";
import { updateCourseZodSchema } from "@/zod/course.validation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditCoursePageProps { params: Promise<{ courseId: string }> }

const EditCoursePage = ({ params }: EditCoursePageProps) => {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [form, setForm] = useState<IUpdateCoursePayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { params.then((p) => setCourseId(p.courseId)); }, [params]);

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-course", courseId],
    queryFn: () => getCourseById(courseId),
    enabled: !!courseId,
  });

  useEffect(() => {
    const course = data?.data;
    if (course) {
      setForm({ title: course.title, description: course.description || "", price: course.price, level: course.level, language: course.language });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: IUpdateCoursePayload) => updateCourse(courseId, payload),
    onSuccess: (res) => {
      if (res.success) { toast.success("Course updated"); router.push("/instructor/dashboard/courses"); }
      else { toast.error(res.message); }
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

  const fieldError = (field: string) => errors[field] && <p className="text-xs text-destructive mt-1">{errors[field]}</p>;

  if (isLoading) return <div className="p-6"><Skeleton className="h-8 w-48" /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Edit Course</h1>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader><CardTitle>Course Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {fieldError("title")}
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min="0" step="0.01" value={form.price || 0} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                {fieldError("price")}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => v && setForm({ ...form, status: v as any })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Changes"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default EditCoursePage;
