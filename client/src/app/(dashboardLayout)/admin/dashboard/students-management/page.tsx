"use client";

import { AdminListPage } from "@/components/shared/AdminListPage";
import { getStudents } from "@/services/student.services";
import { Badge } from "@/components/ui/badge";

const StudentsManagementPage = () => (
  <AdminListPage
    title="Students Management"
    queryKey={["admin-students"]}
    queryFn={() => getStudents()}
    columns={[
      { key: "name", label: "Name", render: (s: any) => s.name },
      { key: "email", label: "Email", render: (s: any) => s.email },
      { key: "contactNumber", label: "Contact", render: (s: any) => s.contactNumber || "—" },
      { key: "status", label: "Status", render: (s: any) => s.isDeleted ? <Badge variant="destructive">Deleted</Badge> : <Badge>Active</Badge> },
    ]}
  />
);

export default StudentsManagementPage;
