"use client";

import { CrudAdminPage } from "@/components/shared/CrudAdminPage";
import { Badge } from "@/components/ui/badge";
import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
} from "./_action";
import { getCourses } from "@/services/course.services";
import { getCategories } from "@/services/category.services";
import { getInstructors } from "@/services/instructor.services";
import { ICourse } from "@/types/course.types";
import { useQuery } from "@tanstack/react-query";

const levelLabels: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  ALL_LEVELS: "All Levels",
};

const statusStyles: Record<string, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700",
  DRAFT: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-canvas-soft text-mute-text",
};

const CoursesManagementPage = () => {
  const categoriesQuery = useQuery({
    queryKey: ["admin-courses-categories"],
    queryFn: () => getCategories(),
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoriesQuery.data?.data ?? [];

  const instructorsQuery = useQuery({
    queryKey: ["admin-courses-instructors"],
    queryFn: () => getInstructors("limit=100"),
    staleTime: 5 * 60 * 1000,
  });
  const instructors = instructorsQuery.data?.data ?? [];

  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  const instructorOptions = instructors.map((i) => ({
    value: i.id,
    label: i.name,
  }));

  return (
    <CrudAdminPage<ICourse>
      title="Courses Management"
      description="Create, edit, publish, and manage every course on the platform."
      queryKey={["admin-courses"]}
      queryFn={async (page) => {
        const res = await getCourses(`page=${page}&limit=10`);
        return { data: res.data, meta: res.meta };
      }}
      columns={[
        { key: "title", label: "Title", render: (c) => c.title },
        {
          key: "level",
          label: "Level",
          render: (c) => <Badge variant="secondary">{levelLabels[c.level] || c.level}</Badge>,
        },
        {
          key: "status",
          label: "Status",
          render: (c) => (
            <Badge className={statusStyles[c.status] ?? ""}>{c.status}</Badge>
          ),
        },
        { key: "price", label: "Price", render: (c) => `$${c.price.toFixed(2)}` },
        { key: "students", label: "Students", render: (c) => c.totalStudents },
      ]}
      fields={[
        { name: "title", label: "Title", placeholder: "Course title", required: true },
        { name: "description", label: "Description", type: "textarea", placeholder: "Short description" },
        {
          name: "categoryId",
          label: "Category",
          type: "select",
          required: true,
          options: categoryOptions,
        },
        {
          name: "instructorId",
          label: "Instructor",
          type: "select",
          required: true,
          options: instructorOptions,
        },
        {
          name: "level",
          label: "Level",
          type: "select",
          required: true,
          options: [
            { value: "BEGINNER", label: "Beginner" },
            { value: "INTERMEDIATE", label: "Intermediate" },
            { value: "ADVANCED", label: "Advanced" },
            { value: "ALL_LEVELS", label: "All Levels" },
          ],
        },
        { name: "language", label: "Language", placeholder: "e.g. English" },
        { name: "price", label: "Price", type: "number", placeholder: "0" },
        {
          name: "status",
          label: "Status",
          type: "select",
          required: true,
          options: [
            { value: "DRAFT", label: "Draft" },
            { value: "PUBLISHED", label: "Published" },
            { value: "ARCHIVED", label: "Archived" },
          ],
        },
      ]}
      createDefaults={() => ({
        title: "",
        description: "",
        categoryId: categoryOptions[0]?.value ?? "",
        instructorId: instructorOptions[0]?.value ?? "",
        level: "BEGINNER",
        language: "English",
        price: "0",
      })}
      toForm={(c) => ({
        title: c.title,
        description: c.description ?? "",
        categoryId: c.categoryId,
        instructorId: c.instructorId,
        level: c.level,
        language: c.language,
        price: String(c.price),
        status: c.status,
      })}
      createMutation={async (values) => {
        const res = await createCourseAction({
          title: values.title,
          description: values.description || undefined,
          categoryId: values.categoryId || undefined,
          instructorId: values.instructorId || undefined,
          level: values.level,
          language: values.language || undefined,
          price: values.price ? Number(values.price) : 0,
        });
        return { success: res.success, message: res.message };
      }}
      updateMutation={async (id, values) => {
        const res = await updateCourseAction(id, {
          title: values.title || undefined,
          description: values.description || undefined,
          categoryId: values.categoryId || undefined,
          instructorId: values.instructorId || undefined,
          level: values.level || undefined,
          language: values.language || undefined,
          price: values.price ? Number(values.price) : undefined,
          status: values.status || undefined,
        });
        return { success: res.success, message: res.message };
      }}
      deleteMutation={async (id) => {
        const res = await deleteCourseAction(id);
        return { success: res.success, message: res.message };
      }}
    />
  );
};

export default CoursesManagementPage;
