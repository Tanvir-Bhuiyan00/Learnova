"use client";

import { CrudAdminPage } from "@/components/shared/CrudAdminPage";
import { Badge } from "@/components/ui/badge";
import {
  createDiscussion,
  deleteDiscussion,
  getDiscussions,
  updateDiscussion,
} from "@/services/discussion.services";
import { getCourses } from "@/services/course.services";
import { IDiscussion } from "@/types/discussion.types";
import { useQuery } from "@tanstack/react-query";

const DiscussionsManagementPage = () => {
  const coursesQuery = useQuery({
    queryKey: ["admin-discussions-courses"],
    queryFn: () => getCourses("status=PUBLISHED&limit=100"),
    staleTime: 5 * 60 * 1000,
  });
  const courses = coursesQuery.data?.data ?? [];

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: c.title,
  }));

  return (
    <CrudAdminPage<IDiscussion>
      title="Discussions Management"
      description="Moderate the course discussions across the platform."
      queryKey={["admin-discussions"]}
      queryFn={async (page) => {
        const res = await getDiscussions(undefined, `page=${page}&limit=10`);
        return { data: res.data, meta: res.meta };
      }}
      columns={[
        { key: "title", label: "Title", render: (d) => d.title },
        {
          key: "resolved",
          label: "Status",
          render: (d) =>
            d.isResolved ? (
              <Badge>Resolved</Badge>
            ) : (
              <Badge variant="secondary">Open</Badge>
            ),
        },
        { key: "pinned", label: "Pinned", render: (d) => (d.isPinned ? "Yes" : "No") },
        {
          key: "createdAt",
          label: "Created",
          render: (d) => new Date(d.createdAt).toLocaleDateString(),
        },
      ]}
      fields={[
        {
          name: "courseId",
          label: "Course",
          type: "select",
          required: true,
          options: courseOptions,
        },
        { name: "title", label: "Title", placeholder: "Discussion title", required: true },
        { name: "content", label: "Content", type: "textarea", placeholder: "Discussion details", required: true },
      ]}
      createDefaults={() => ({
        courseId: courseOptions[0]?.value ?? "",
        title: "",
        content: "",
      })}
      toForm={(d) => ({
        courseId: d.courseId,
        title: d.title,
        content: d.content,
      })}
      createMutation={async (values) => {
        const res = await createDiscussion({
          courseId: values.courseId,
          title: values.title,
          content: values.content,
        });
        return { success: res.success, message: res.message };
      }}
      updateMutation={async (id, values) => {
        const res = await updateDiscussion(id, {
          title: values.title,
          content: values.content,
        });
        return { success: res.success, message: res.message };
      }}
      deleteMutation={async (id) => {
        const res = await deleteDiscussion(id);
        return { success: res.success, message: res.message };
      }}
    />
  );
};

export default DiscussionsManagementPage;
