"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { deleteCourseAction } from "./_action";
import { getCourses } from "@/services/course.services";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced", ALL_LEVELS: "All Levels",
};

const CoursesManagementPage = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteCourseAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Course deleted");
        queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      } else { toast.error(res.message); }
    },
  });

  return (
    <AdminListPage
      title="Courses Management"
      queryKey={["admin-courses"]}
      queryFn={() => getCourses()}
      onDelete={(id) => deleteMutation.mutate(id)}
      columns={[
        { key: "title", label: "Title", render: (c: any) => c.title },
        { key: "level", label: "Level", render: (c: any) => <Badge variant="secondary">{levelLabels[c.level] || c.level}</Badge> },
        { key: "status", label: "Status", render: (c: any) => <Badge>{c.status}</Badge> },
        { key: "price", label: "Price", render: (c: any) => `$${c.price.toFixed(2)}` },
        { key: "students", label: "Students", render: (c: any) => c.totalStudents },
      ]}
    />
  );
};

export default CoursesManagementPage;
