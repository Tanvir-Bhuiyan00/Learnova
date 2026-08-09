"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { getAllEnrollments } from "@/services/enrollment.services";
import { Badge } from "@/components/ui/badge";

const EnrollmentsManagementPage = () => (
  <AdminListPage
    title="Enrollments Management"
    queryKey={["admin-enrollments"]}
    queryFn={() => getAllEnrollments()}
    columns={[
      { key: "id", label: "ID", render: (e: any) => e.id.slice(0, 8) + "..." },
      { key: "studentId", label: "Student ID", render: (e: any) => e.studentId.slice(0, 8) + "..." },
      { key: "courseId", label: "Course ID", render: (e: any) => e.courseId.slice(0, 8) + "..." },
      { key: "progress", label: "Progress", render: (e: any) => `${Math.round(e.progress)}%` },
      { key: "status", label: "Status", render: (e: any) => e.isCompleted ? <Badge>Completed</Badge> : <Badge variant="secondary">In Progress</Badge> },
      { key: "createdAt", label: "Enrolled", render: (e: any) => new Date(e.createdAt).toLocaleDateString() },
    ]}
  />
);

export default EnrollmentsManagementPage;
